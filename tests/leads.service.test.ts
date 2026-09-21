import { describe, it, expect, vi, beforeEach } from "vitest"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createLead,
  softDeleteLead,
  restoreLead,
  getLeads,
  validateAssigneeMembership,
} from "@/lib/services/leads.service"
import * as getCurrentOrgModule from "@/lib/auth/getCurrentOrganization"
import * as serverClientModule from "@/lib/supabase/server"

interface MockLeadPayload {
  deleted_at?: string | null
  [key: string]: unknown
}

interface MockActivityPayload {
  action?: string
  entity_type?: string
  entity_id?: string
  user_id?: string
  organization_id?: string
  actor_type?: string
  [key: string]: unknown
}

describe("Leads Service & Authorization Architecture", () => {
  const mockOrgId = "11111111-1111-1111-1111-111111111111"
  const mockUserId = "33333333-3333-3333-3333-333333333333"
  const mockLeadId = "44444444-4444-4444-4444-444444444444"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Role Authorization Guard (assertRole)", () => {
    it("allows 'owner', 'admin', and 'member' roles to perform mutations", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Acme Corp",
        organizationSlug: "acme",
        userRole: "member",
      })

      const auth = await assertRole(["owner", "admin", "member"])
      expect(auth.organizationId).toBe(mockOrgId)
      expect(auth.userRole).toBe("member")
    })

    it("blocks 'viewer' role from mutating leads", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Acme Corp",
        organizationSlug: "acme",
        userRole: "viewer",
      })

      await expect(
        assertRole(["owner", "admin", "member"])
      ).rejects.toThrow(/Forbidden: Required role \[owner, admin, member\], but current role is "viewer"/)
    })

    it("blocks requests when user has no active organization membership", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue(null)

      await expect(
        assertRole(["owner", "admin", "member"])
      ).rejects.toThrow(/Unauthorized: User has no active organization membership/)
    })
  })

  describe("Assignee Organization Boundary Validation", () => {
    it("rejects assigning a lead to a user outside the active organization", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateAssigneeMembership(
        "foreign-user-id",
        mockOrgId
      )
      expect(isValid).toBe(false)
    })

    it("approves assigning a lead to a user who is an active member", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: "membership-123" },
                error: null,
              }),
            }),
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateAssigneeMembership(mockUserId, mockOrgId)
      expect(isValid).toBe(true)
    })
  })

  describe("Cross-Organization Lead Access Protection", () => {
    it("guarantees query strictly filters by the authenticated organization ID", async () => {
      let queriedOrgId: string | null = null
      let filteredSoftDelete = false

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockImplementation((col: string, val: string) => {
            if (col === "organization_id") {
              queriedOrgId = val
            }
            return mockSupabase.from()
          }),
          is: vi.fn().mockImplementation((col: string, val: unknown) => {
            if (col === "deleted_at" && val === null) {
              filteredSoftDelete = true
            }
            return mockSupabase.from()
          }),
          order: vi.fn().mockReturnThis(),
          range: vi.fn().mockResolvedValue({
            data: [],
            count: 0,
            error: null,
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await getLeads(
        { page: 1, pageSize: 10, sortBy: "created_at", sortOrder: "desc", includeDeleted: false },
        mockOrgId
      )

      expect(queriedOrgId).toBe(mockOrgId)
      expect(filteredSoftDelete).toBe(true)
    })
  })

  describe("Soft Delete & Restore Behavior", () => {
    it("softDeleteLead sets deleted_at timestamp and logs lead.deleted activity", async () => {
      let updatedPayload: MockLeadPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((record: MockActivityPayload) => {
                loggedActivity = record
                return Promise.resolve({ error: null })
              }),
            }
          }
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({
              data: {
                id: mockLeadId,
                first_name: "Bruce",
                last_name: "Wayne",
                company: "Wayne Enterprises",
                deleted_at: null,
              },
              error: null,
            }),
            update: vi.fn().mockImplementation((payload: MockLeadPayload) => {
              updatedPayload = payload
              return {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: { id: mockLeadId, ...payload },
                  error: null,
                }),
              }
            }),
          }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const deletedLead = await softDeleteLead(mockLeadId, mockOrgId, mockUserId)

      expect(deletedLead).toBeDefined()
      expect(updatedPayload.deleted_at).toBeDefined()
      expect(typeof updatedPayload.deleted_at).toBe("string")

      expect(loggedActivity.action).toBe("lead.deleted")
      expect(loggedActivity.entity_type).toBe("lead")
      expect(loggedActivity.entity_id).toBe(mockLeadId)
      expect(loggedActivity.user_id).toBe(mockUserId)
    })

    it("restoreLead clears deleted_at (sets null) and logs lead.restored activity", async () => {
      let updatedPayload: MockLeadPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((record: MockActivityPayload) => {
                loggedActivity = record
                return Promise.resolve({ error: null })
              }),
            }
          }
          return {
            update: vi.fn().mockImplementation((payload: MockLeadPayload) => {
              updatedPayload = payload
              return {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: mockLeadId,
                    first_name: "Bruce",
                    last_name: "Wayne",
                    ...payload,
                  },
                  error: null,
                }),
              }
            }),
          }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await restoreLead(mockLeadId, mockOrgId, mockUserId)

      expect(updatedPayload.deleted_at).toBeNull()
      expect(loggedActivity.action).toBe("lead.restored")
      expect(loggedActivity.entity_id).toBe(mockLeadId)
    })
  })

  describe("Activity Logging Security", () => {
    it("ensures actor context is captured from server context rather than browser client", async () => {
      let activityRecord: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload: MockActivityPayload) => {
                activityRecord = payload
                return Promise.resolve({ error: null })
              }),
            }
          }
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: mockLeadId,
                    organization_id: mockOrgId,
                    first_name: "Clark",
                    last_name: "Kent",
                    status: "new",
                  },
                  error: null,
                }),
              }),
            }),
          }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await createLead(
        {
          first_name: "Clark",
          last_name: "Kent",
          status: "new",
        },
        mockOrgId,
        mockUserId
      )

      expect(activityRecord.organization_id).toBe(mockOrgId)
      expect(activityRecord.user_id).toBe(mockUserId)
      expect(activityRecord.actor_type).toBe("user")
      expect(activityRecord.action).toBe("lead.created")
    })
  })
})
