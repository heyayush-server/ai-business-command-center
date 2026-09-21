import { describe, it, expect, vi, beforeEach } from "vitest"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createDeal,
  changeDealStage,
  softDeleteDeal,
  restoreDeal,
  validateCustomerBelongsToOrg,
} from "@/lib/services/deals.service"
import { validateAssigneeMembership } from "@/lib/services/leads.service"
import * as getCurrentOrgModule from "@/lib/auth/getCurrentOrganization"
import * as serverClientModule from "@/lib/supabase/server"

interface MockDealPayload {
  title?: string
  name?: string
  value?: number
  currency?: string
  stage?: string
  organization_id?: string
  customer_id?: string
  expected_close?: string | null
  expected_close_date?: string | null
  assigned_to?: string | null
  notes?: string | null
  deleted_at?: string | null
  updated_at?: string
  [key: string]: unknown
}

interface MockActivityPayload {
  action?: string
  entity_type?: string
  entity_id?: string
  user_id?: string
  organization_id?: string
  actor_type?: string
  details?: Record<string, unknown>
  [key: string]: unknown
}

describe("Deals Service & Pipeline Architecture", () => {
  const mockOrgId = "11111111-1111-1111-1111-111111111111"
  const mockUserId = "22222222-2222-2222-2222-222222222222"
  const mockCustomerId = "33333333-3333-3333-3333-333333333333"
  const mockDealId = "44444444-4444-4444-4444-444444444444"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Role Authorization Guard (assertRole)", () => {
    it("allows 'owner', 'admin', and 'member' roles to modify deals", async () => {
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

    it("restricts 'viewer' role from creating or modifying deals", async () => {
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

  describe("Customer Relationship Verification", () => {
    it("verifies customer belongs to the active organization", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: mockCustomerId },
            error: null,
          }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateCustomerBelongsToOrg(mockCustomerId, mockOrgId)
      expect(isValid).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith("customers")
    })

    it("rejects deals attached to a non-existent or foreign customer account", async () => {
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

      const isValid = await validateCustomerBelongsToOrg(mockCustomerId, mockOrgId)
      expect(isValid).toBe(false)
    })
  })

  describe("Member Assignment Validation", () => {
    it("rejects assigning a deal to a user outside the active organization", async () => {
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

      const foreignUserId = "99999999-9999-9999-9999-999999999999"
      const isValid = await validateAssigneeMembership(foreignUserId, mockOrgId)
      expect(isValid).toBe(false)
    })
  })

  describe("Deal Creation & Activity Logging", () => {
    it("creates deal with organization_id, mirrored name, and logs deal_created activity", async () => {
      let insertedDealPayload: MockDealPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "customers") {
            return {
              select: vi.fn().mockReturnThis(),
              eq: vi.fn().mockReturnThis(),
              is: vi.fn().mockReturnThis(),
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: mockCustomerId },
                error: null,
              }),
            }
          }
          if (table === "deals") {
            return {
              insert: vi.fn().mockImplementation((payload: MockDealPayload) => {
                insertedDealPayload = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: mockDealId,
                        organization_id: mockOrgId,
                        customer_id: mockCustomerId,
                        title: payload.title,
                        name: payload.title,
                        value: payload.value,
                        stage: payload.stage,
                        currency: payload.currency,
                        expected_close: payload.expected_close,
                        expected_close_date: payload.expected_close,
                        assigned_to: payload.assigned_to,
                        notes: payload.notes,
                        deleted_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        customer: {
                          id: mockCustomerId,
                          name: "Acme Corp",
                          primary_contact_name: "Alice",
                          primary_contact_email: "alice@acme.com",
                        },
                        assigned_user: null,
                      },
                      error: null,
                    }),
                  }),
                }
              }),
            }
          }
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload: MockActivityPayload) => {
                loggedActivity = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "act-1", ...payload },
                      error: null,
                    }),
                  }),
                }
              }),
            }
          }
          return { select: vi.fn().mockReturnThis() }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const input = {
        title: "Enterprise Annual Contract",
        customer_id: mockCustomerId,
        stage: "discovery" as const,
        value: 50000,
        currency: "USD",
        expected_close: "2026-11-30",
        assigned_to: null,
        notes: "Initial discovery call completed.",
      }

      const created = await createDeal(mockOrgId, mockUserId, input)

      expect(created.id).toBe(mockDealId)
      expect(created.title).toBe("Enterprise Annual Contract")
      expect(insertedDealPayload.organization_id).toBe(mockOrgId)
      expect(insertedDealPayload.customer_id).toBe(mockCustomerId)
      expect(insertedDealPayload.name).toBe("Enterprise Annual Contract") // backwards-compatible mirror

      expect(loggedActivity.action).toBe("deal_created")
      expect(loggedActivity.entity_type).toBe("deal")
      expect(loggedActivity.entity_id).toBe(mockDealId)
      expect(loggedActivity.organization_id).toBe(mockOrgId)
    })
  })

  describe("Stage Transition & Audit Trail", () => {
    it("updates deal stage and logs previous and new stage in activity details", async () => {
      let updatedPayload: MockDealPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "deals") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: {
                        id: mockDealId,
                        organization_id: mockOrgId,
                        customer_id: mockCustomerId,
                        title: "Big Deal",
                        name: "Big Deal",
                        stage: "discovery",
                        value: 80000,
                        currency: "USD",
                        expected_close: null,
                        expected_close_date: null,
                        assigned_to: null,
                        notes: null,
                        deleted_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((payload: MockDealPayload) => {
                updatedPayload = payload
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                      select: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                          data: {
                            id: mockDealId,
                            organization_id: mockOrgId,
                            title: "Big Deal",
                            name: "Big Deal",
                            stage: payload.stage,
                            value: 80000,
                            currency: "USD",
                            expected_close: null,
                            expected_close_date: null,
                            assigned_to: null,
                            notes: null,
                            deleted_at: null,
                            created_at: new Date().toISOString(),
                            updated_at: payload.updated_at,
                          },
                          error: null,
                        }),
                      }),
                    }),
                  }),
                }
              }),
            }
          }
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload: MockActivityPayload) => {
                loggedActivity = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: { id: "act-stage", ...payload },
                      error: null,
                    }),
                  }),
                }
              }),
            }
          }
          return { select: vi.fn().mockReturnThis() }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const result = await changeDealStage(
        mockDealId,
        mockOrgId,
        mockUserId,
        "negotiation"
      )

      expect(result.stage).toBe("negotiation")
      expect(updatedPayload.stage).toBe("negotiation")

      expect(loggedActivity.action).toBe("deal_stage_changed")
      expect(loggedActivity.entity_id).toBe(mockDealId)
      expect(loggedActivity.details?.previous_stage).toBe("discovery")
      expect(loggedActivity.details?.new_stage).toBe("negotiation")
    })
  })

  describe("Soft Delete & Restore Flow", () => {
    it("soft-deletes a deal and logs deal_deleted activity", async () => {
      let softDeletedPayload: MockDealPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "deals") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: {
                        id: mockDealId,
                        organization_id: mockOrgId,
                        title: "Deletable Deal",
                        name: "Deletable Deal",
                        stage: "discovery",
                        deleted_at: null,
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((payload: MockDealPayload) => {
                softDeletedPayload = payload
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                  }),
                }
              }),
            }
          }
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload: MockActivityPayload) => {
                loggedActivity = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: "act-del" }, error: null }),
                  }),
                }
              }),
            }
          }
          return { select: vi.fn().mockReturnThis() }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await softDeleteDeal(mockDealId, mockOrgId, mockUserId)

      expect(softDeletedPayload.deleted_at).toBeDefined()
      expect(loggedActivity.action).toBe("deal_deleted")
    })

    it("restores an archived deal and logs deal_restored activity", async () => {
      let restoredPayload: MockDealPayload = {}
      let loggedActivity: MockActivityPayload = {}

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "deals") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockReturnValue({
                    not: vi.fn().mockReturnValue({
                      maybeSingle: vi.fn().mockResolvedValue({
                        data: {
                          id: mockDealId,
                          organization_id: mockOrgId,
                          title: "Archived Deal",
                          name: "Archived Deal",
                          deleted_at: "2026-09-01T00:00:00Z",
                        },
                        error: null,
                      }),
                    }),
                  }),
                }),
              }),
              update: vi.fn().mockImplementation((payload: MockDealPayload) => {
                restoredPayload = payload
                return {
                  eq: vi.fn().mockReturnValue({
                    eq: vi.fn().mockResolvedValue({ error: null }),
                  }),
                }
              }),
            }
          }
          if (table === "activities") {
            return {
              insert: vi.fn().mockImplementation((payload: MockActivityPayload) => {
                loggedActivity = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: "act-res" }, error: null }),
                  }),
                }
              }),
            }
          }
          return { select: vi.fn().mockReturnThis() }
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await restoreDeal(mockDealId, mockOrgId, mockUserId)

      expect(restoredPayload.deleted_at).toBeNull()
      expect(loggedActivity.action).toBe("deal_restored")
    })
  })
})
