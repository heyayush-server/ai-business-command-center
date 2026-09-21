import { describe, it, expect, vi, beforeEach } from "vitest"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createManualActivity,
  logActivity,
  getActivities,
  getEntityActivities,
  validateEntityBelongsToOrg,
} from "@/lib/services/activities.service"
import { createActivitySchema } from "@/lib/validations/activity.schema"
import * as getCurrentOrgModule from "@/lib/auth/getCurrentOrganization"
import * as serverClientModule from "@/lib/supabase/server"

interface MockActivityPayload {
  organization_id?: string
  actor_type?: string
  user_id?: string | null
  entity_type?: string
  entity_id?: string | null
  action?: string
  title?: string | null
  description?: string | null
  details?: Record<string, unknown>
  [key: string]: unknown
}

describe("Activities Service & Timeline Architecture", () => {
  const mockOrgId = "11111111-1111-4111-8111-111111111111"
  const mockUserId = "22222222-2222-4222-8222-222222222222"
  const mockLeadId = "33333333-3333-4333-8333-333333333333"
  const mockCustomerId = "44444444-4444-4444-8444-444444444444"
  const mockActivityId = "55555555-5555-4555-8555-555555555555"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Role Authorization Guard (assertRole)", () => {
    it("allows 'owner', 'admin', and 'member' roles to record activities", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Wayne Enterprises",
        organizationSlug: "wayne",
        userRole: "member",
      })

      const auth = await assertRole(["owner", "admin", "member"])
      expect(auth.organizationId).toBe(mockOrgId)
      expect(auth.userRole).toBe("member")
    })

    it("restricts 'viewer' role from creating manual activities", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Wayne Enterprises",
        organizationSlug: "wayne",
        userRole: "viewer",
      })

      await expect(
        assertRole(["owner", "admin", "member"])
      ).rejects.toThrow(/Forbidden: Required role \[owner, admin, member\], but current role is "viewer"/)
    })
  })

  describe("Entity Ownership & Organization Isolation", () => {
    it("validates that lead belongs to the active organization", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: mockLeadId },
            error: null,
          }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateEntityBelongsToOrg("lead", mockLeadId, mockOrgId)
      expect(isValid).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith("leads")
    })

    it("rejects entity belonging to a different organization or soft-deleted", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateEntityBelongsToOrg("customer", mockCustomerId, mockOrgId)
      expect(isValid).toBe(false)
    })

    it("rejects manual activity creation if target entity belongs to another org", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await expect(
        createManualActivity(
          mockOrgId,
          mockUserId,
          createActivitySchema.parse({
            action: "call",
            title: "Discovery call with VP",
            entity_type: "lead",
            entity_id: mockLeadId,
          })
        )
      ).rejects.toThrow("Selected lead not found or does not belong to your organization")
    })
  })

  describe("Manual Activity Creation", () => {
    it("creates a manual activity on an entity and stores title and description", async () => {
      let insertedPayload: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "leads") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              is: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: mockLeadId },
                error: null,
              }),
            }
          }
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload) => {
                insertedPayload = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: mockActivityId,
                        organization_id: mockOrgId,
                        actor_type: payload.actor_type,
                        user_id: payload.user_id,
                        entity_type: payload.entity_type,
                        entity_id: payload.entity_id,
                        action: payload.action,
                        title: payload.title,
                        description: payload.description,
                        details: payload.details,
                        created_at: new Date().toISOString(),
                        actor: {
                          id: mockUserId,
                          full_name: "Bruce Wayne",
                          email: "bruce@wayne.com",
                          avatar_url: null,
                        },
                      },
                      error: null,
                    }),
                  }),
                }
              }),
            }
          }
          return {}
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const result = await createManualActivity(
        mockOrgId,
        mockUserId,
        createActivitySchema.parse({
          action: "meeting",
          title: "Executive Product Demonstration",
          description: "Demo went smoothly. Client asked about enterprise SLA.",
          entity_type: "lead",
          entity_id: mockLeadId,
        })
      )

      expect(result.id).toBe(mockActivityId)
      expect(result.title).toBe("Executive Product Demonstration")
      expect(insertedPayload.actor_type).toBe("user")
      expect(insertedPayload.user_id).toBe(mockUserId)
      expect(insertedPayload.action).toBe("meeting")
      expect(insertedPayload.organization_id).toBe(mockOrgId)
    })
  })

  describe("Automatic Activity Logging (logActivity)", () => {
    it("appends activity event with extracted title from details", async () => {
      let insertedPayload: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockImplementation((payload) => {
            insertedPayload = payload
            return Promise.resolve({ error: null })
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await logActivity({
        organizationId: mockOrgId,
        userId: mockUserId,
        action: "deal_stage_changed",
        entityType: "deal",
        entityId: "66666666-6666-4666-8666-666666666666",
        details: {
          title: "Enterprise Deal",
          previous_stage: "discovery",
          new_stage: "proposal",
        },
      })

      expect(insertedPayload.action).toBe("deal_stage_changed")
      expect(insertedPayload.title).toBe("Enterprise Deal")
      expect(insertedPayload.organization_id).toBe(mockOrgId)
    })
  })

  describe("Entity Timeline & Global Activities Query", () => {
    it("retrieves entity timeline ordered by created_at DESC", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: [
                      {
                        id: mockActivityId,
                        organization_id: mockOrgId,
                        action: "call",
                        title: "Phone Call",
                        created_at: new Date().toISOString(),
                      },
                    ],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const timeline = await getEntityActivities(mockOrgId, "lead", mockLeadId)
      expect(timeline.length).toBe(1)
      expect(timeline[0].title).toBe("Phone Call")
    })

    it("retrieves paginated global activities with total count", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: [
                    {
                      id: mockActivityId,
                      organization_id: mockOrgId,
                      action: "note",
                      title: "Company Memo",
                      entity_type: "organization",
                      entity_id: null,
                      created_at: new Date().toISOString(),
                    },
                  ],
                  error: null,
                  count: 1,
                }),
              }),
            }),
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const result = await getActivities({ page: 1, pageSize: 20 }, mockOrgId)
      expect(result.activities.length).toBe(1)
      expect(result.total).toBe(1)
      expect(result.totalPages).toBe(1)
    })
  })
})
