import { describe, it, expect, vi, beforeEach } from "vitest"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer,
  convertLeadToCustomer,
  getCustomers,
} from "@/lib/services/customers.service"
import { validateAssigneeMembership } from "@/lib/services/leads.service"
import * as getCurrentOrgModule from "@/lib/auth/getCurrentOrganization"
import * as serverClientModule from "@/lib/supabase/server"

interface MockCustomerPayload {
  deleted_at?: string | null
  status?: string
  name?: string
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

describe("Customers Service & Conversion Architecture", () => {
  const mockOrgId = "11111111-1111-1111-1111-111111111111"
  const mockUserId = "22222222-2222-2222-2222-222222222222"
  const mockCustomerId = "33333333-3333-3333-3333-333333333333"
  const mockLeadId = "44444444-4444-4444-4444-444444444444"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Role Authorization Guard (assertRole)", () => {
    it("allows 'owner', 'admin', and 'member' roles to perform customer mutations", async () => {
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

    it("restricts 'viewer' role from creating or modifying customers", async () => {
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

  describe("Assignee Member Verification", () => {
    it("rejects assigning an account to a user outside the active organization", async () => {
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

      const isValid = await validateAssigneeMembership("foreign-user", mockOrgId)
      expect(isValid).toBe(false)
    })
  })

  describe("Customer Creation & Updates", () => {
    it("creates a customer and logs customer.created activity", async () => {
      let insertedPayload: MockCustomerPayload = {}
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
          if (table === "customers") {
            return {
              insert: vi.fn().mockImplementation((payload: MockCustomerPayload) => {
                insertedPayload = { id: mockCustomerId, ...payload }
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: insertedPayload,
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

      const customer = await createCustomer(
        {
          name: "Wayne Enterprises",
          industry: "Technology & Defense",
          status: "active",
        },
        mockOrgId,
        mockUserId
      )

      expect(customer.id).toBe(mockCustomerId)
      expect(insertedPayload.name).toBe("Wayne Enterprises")
      expect(loggedActivity.action).toBe("customer.created")
      expect(loggedActivity.entity_id).toBe(mockCustomerId)
      expect(loggedActivity.user_id).toBe(mockUserId)
    })

    it("updates a customer and logs customer.updated activity", async () => {
      let updatedPayload: MockCustomerPayload = {}
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
          if (table === "customers") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: {
                  id: mockCustomerId,
                  organization_id: mockOrgId,
                  name: "Wayne Enterprises",
                  status: "active",
                },
                error: null,
              }),
              update: vi.fn().mockImplementation((payload: MockCustomerPayload) => {
                updatedPayload = payload
                return {
                  eq: vi.fn().mockReturnThis(),
                  select: vi.fn().mockReturnThis(),
                  single: vi.fn().mockResolvedValue({
                    data: { id: mockCustomerId, ...payload },
                    error: null,
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

      const updated = await updateCustomer(
        mockCustomerId,
        { id: mockCustomerId, name: "Wayne Enterprises Global" },
        mockOrgId,
        mockUserId
      )

      expect(updated.id).toBe(mockCustomerId)
      expect(updatedPayload.name).toBe("Wayne Enterprises Global")
      expect(loggedActivity.action).toBe("customer.updated")
    })
  })

  describe("Organization Isolation in Customer Queries", () => {
    it("guarantees customer list strictly queries by the authenticated organization ID", async () => {
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

      await getCustomers(
        { page: 1, pageSize: 10, sortBy: "created_at", sortOrder: "desc", includeDeleted: false },
        mockOrgId
      )

      expect(queriedOrgId).toBe(mockOrgId)
      expect(filteredSoftDelete).toBe(true)
    })
  })

  describe("Lead to Customer Conversion Workflow", () => {
    it("converts a lead into a customer, marks lead qualified, and logs activity", async () => {
      let insertedCustomer: MockCustomerPayload = {}
      let updatedLead: Record<string, unknown> = {}
      const loggedActivities: MockActivityPayload[] = []

      const mockLeadData = {
        id: mockLeadId,
        organization_id: mockOrgId,
        first_name: "Bruce",
        last_name: "Wayne",
        company: "Wayne Enterprises",
        email: "bruce@wayne.com",
        phone: "+1-555-0199",
        status: "qualifying",
        source: "Inbound",
        assigned_to: mockUserId,
        metadata: {},
      }

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((record: MockActivityPayload) => {
                loggedActivities.push(record)
                return Promise.resolve({ error: null })
              }),
            }
          }
          if (table === "organization_members") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "mem-1" },
                    error: null,
                  }),
                }),
              }),
            }
          }
          if (table === "leads") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: mockLeadData,
                    error: null,
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
                updatedLead = payload
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                  }),
                }
              }),
            }
          }
          if (table === "customers") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  // No existing customer converted from this lead
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: null,
                    error: null,
                  }),
                }),
              }),
              insert: vi.fn().mockImplementation((payload: MockCustomerPayload) => {
                insertedCustomer = { id: mockCustomerId, ...payload }
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: insertedCustomer,
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

      const result = await convertLeadToCustomer(
        mockLeadId,
        mockOrgId,
        mockUserId,
        { industry: "Technology & Defense" }
      )

      // Verified customer attributes
      expect(result.id).toBe(mockCustomerId)
      expect(insertedCustomer.name).toBe("Wayne Enterprises")
      expect(insertedCustomer.converted_from_lead_id).toBe(mockLeadId)
      expect(insertedCustomer.primary_contact_name).toBe("Bruce Wayne")
      expect(insertedCustomer.primary_contact_email).toBe("bruce@wayne.com")
      expect(insertedCustomer.industry).toBe("Technology & Defense")

      // Verified lead updated to qualified with customer back-reference
      expect(updatedLead.status).toBe("qualified")
      const meta = updatedLead.metadata as Record<string, unknown>
      expect(meta.converted_to_customer_id).toBe(mockCustomerId)

      // Verified dual activity logs (lead converted + customer created)
      expect(loggedActivities.length).toBe(2)
      expect(loggedActivities.some((a) => a.action === "lead.converted_to_customer")).toBe(true)
      expect(loggedActivities.some((a) => a.action === "customer.created_from_lead")).toBe(true)
    })

    it("prevents duplicate conversion of the same lead", async () => {
      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "customers") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: { id: "existing-customer-id", name: "Already Converted Corp" },
                    error: null,
                  }),
                }),
              }),
            }
          }
          return {}
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await expect(
        convertLeadToCustomer(mockLeadId, mockOrgId, mockUserId)
      ).rejects.toThrow(/This lead has already been converted/)
    })
  })

  describe("Soft Delete & Restore Behavior", () => {
    it("softDeleteCustomer sets deleted_at timestamp and logs activity", async () => {
      let updatedPayload: MockCustomerPayload = {}
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
                id: mockCustomerId,
                name: "Stark Industries",
                deleted_at: null,
              },
              error: null,
            }),
            update: vi.fn().mockImplementation((payload: MockCustomerPayload) => {
              updatedPayload = payload
              return {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: { id: mockCustomerId, ...payload },
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

      await softDeleteCustomer(mockCustomerId, mockOrgId, mockUserId)

      expect(updatedPayload.deleted_at).toBeDefined()
      expect(typeof updatedPayload.deleted_at).toBe("string")
      expect(loggedActivity.action).toBe("customer.deleted")
      expect(loggedActivity.entity_type).toBe("customer")
      expect(loggedActivity.entity_id).toBe(mockCustomerId)
    })

    it("restoreCustomer sets deleted_at to null and logs activity", async () => {
      let updatedPayload: MockCustomerPayload = {}
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
            update: vi.fn().mockImplementation((payload: MockCustomerPayload) => {
              updatedPayload = payload
              return {
                eq: vi.fn().mockReturnThis(),
                select: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({
                  data: { id: mockCustomerId, name: "Stark Industries", ...payload },
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

      await restoreCustomer(mockCustomerId, mockOrgId, mockUserId)

      expect(updatedPayload.deleted_at).toBeNull()
      expect(loggedActivity.action).toBe("customer.restored")
      expect(loggedActivity.entity_id).toBe(mockCustomerId)
    })
  })
})
