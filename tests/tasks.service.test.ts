import { describe, it, expect, vi, beforeEach } from "vitest"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  softDeleteTask,
  restoreTask,
  validateLeadBelongsToOrg,
  validateCustomerBelongsToOrg,
  validateDealBelongsToOrg,
} from "@/lib/services/tasks.service"
import * as leadsServiceModule from "@/lib/services/leads.service"
import * as activitiesServiceModule from "@/lib/services/activities.service"
import * as getCurrentOrgModule from "@/lib/auth/getCurrentOrganization"
import * as serverClientModule from "@/lib/supabase/server"
import { createTaskSchema } from "@/lib/validations/task.schema"

interface MockTaskPayload {
  title?: string
  description?: string | null
  status?: string
  priority?: string
  organization_id?: string
  created_by?: string | null
  assigned_to?: string | null
  lead_id?: string | null
  customer_id?: string | null
  deal_id?: string | null
  due_date?: string | null
  deleted_at?: string | null
  updated_at?: string
  [key: string]: unknown
}

interface MockActivityPayload {
  action?: string
  entityType?: string
  entityId?: string
  userId?: string
  organizationId?: string
  details?: Record<string, unknown>
  [key: string]: unknown
}

describe("Tasks Service & Operations Architecture", () => {
  const mockOrgId = "11111111-1111-4111-8111-111111111111"
  const mockUserId = "22222222-2222-4222-8222-222222222222"
  const mockLeadId = "33333333-3333-4333-8333-333333333333"
  const mockCustomerId = "44444444-4444-4444-8444-444444444444"
  const mockDealId = "55555555-5555-4555-8555-555555555555"
  const mockTaskId = "66666666-6666-4666-8666-666666666666"

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("Role Authorization Guard (assertRole)", () => {
    it("allows 'owner', 'admin', and 'member' roles to modify tasks", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Apex Logistics",
        organizationSlug: "apex",
        userRole: "member",
      })

      const auth = await assertRole(["owner", "admin", "member"])
      expect(auth.organizationId).toBe(mockOrgId)
      expect(auth.userRole).toBe("member")
    })

    it("restricts 'viewer' role from creating or modifying tasks", async () => {
      vi.spyOn(getCurrentOrgModule, "getCurrentOrganization").mockResolvedValue({
        organizationId: mockOrgId,
        organizationName: "Apex Logistics",
        organizationSlug: "apex",
        userRole: "viewer",
      })

      await expect(
        assertRole(["owner", "admin", "member"])
      ).rejects.toThrow(/Forbidden: Required role \[owner, admin, member\], but current role is "viewer"/)
    })
  })

  describe("Linked Entity & Cross-Org Isolation Verification", () => {
    it("validates lead belongs to the active organization", async () => {
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

      const isValid = await validateLeadBelongsToOrg(mockLeadId, mockOrgId)
      expect(isValid).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith("leads")
    })

    it("rejects lead belonging to a different organization or soft-deleted", async () => {
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

      const isValid = await validateLeadBelongsToOrg(mockLeadId, mockOrgId)
      expect(isValid).toBe(false)
    })

    it("validates customer belongs to active organization", async () => {
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

    it("validates deal belongs to active organization", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: mockDealId },
            error: null,
          }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      const isValid = await validateDealBelongsToOrg(mockDealId, mockOrgId)
      expect(isValid).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith("deals")
    })
  })

  describe("Task Creation & Entity Validation", () => {
    it("rejects task creation if linked lead does not belong to organization", async () => {
      // Mock validateLead to return false
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          is: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }
      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await expect(
        createTask(
          mockOrgId,
          mockUserId,
          createTaskSchema.parse({
            title: "Follow up with lead",
            lead_id: mockLeadId,
            status: "todo",
            priority: "medium",
          })
        )
      ).rejects.toThrow("Selected lead not found or does not belong to your organization")
    })

    it("rejects task creation if assigned user is not an active org member", async () => {
      vi.spyOn(leadsServiceModule, "validateAssigneeMembership").mockResolvedValue(false)

      await expect(
        createTask(
          mockOrgId,
          mockUserId,
          createTaskSchema.parse({
            title: "Prepare audit report",
            assigned_to: "99999999-9999-4999-8999-999999999999",
            status: "todo",
            priority: "high",
          })
        )
      ).rejects.toThrow("Assigned user is not an active member of this organization")
    })

    it("creates task, sets created_by, and logs 'task_created' activity", async () => {
      let insertedPayload: MockTaskPayload = {}
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === "tasks") {
            return {
              insert: vi.fn().mockImplementation((payload) => {
                insertedPayload = payload
                return {
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: mockTaskId,
                        organization_id: mockOrgId,
                        title: payload.title,
                        description: payload.description,
                        status: payload.status,
                        priority: payload.priority,
                        assigned_to: payload.assigned_to,
                        created_by: payload.created_by,
                        due_date: payload.due_date,
                        lead_id: null,
                        customer_id: null,
                        deal_id: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        deleted_at: null,
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

      const result = await createTask(
        mockOrgId,
        mockUserId,
        createTaskSchema.parse({
          title: "Send NDA to Partner",
          description: "Standard mutual non-disclosure agreement",
          status: "todo",
          priority: "urgent",
          due_date: "2026-11-01",
        })
      )

      expect(result.id).toBe(mockTaskId)
      expect(result.title).toBe("Send NDA to Partner")
      expect(insertedPayload.created_by).toBe(mockUserId)
      expect(insertedPayload.organization_id).toBe(mockOrgId)
      expect(insertedPayload.priority).toBe("urgent")

      expect(loggedActivity.action).toBe("task_created")
      expect(loggedActivity.entityType).toBe("task")
      expect(loggedActivity.entityId).toBe(mockTaskId)
      expect(loggedActivity.organizationId).toBe(mockOrgId)
      expect(loggedActivity.details?.priority).toBe("urgent")
    })

    it("updates task fields and logs 'task_updated' activity", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Initial Task",
                    description: "Initial description",
                    status: "todo",
                    priority: "low",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: mockTaskId,
                      organization_id: mockOrgId,
                      title: "Updated Task Title",
                      description: "Initial description",
                      status: "todo",
                      priority: "urgent",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      deleted_at: null,
                    },
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

      const result = await updateTask(mockTaskId, mockOrgId, mockUserId, {
        id: mockTaskId,
        title: "Updated Task Title",
        priority: "urgent",
      })

      expect(result.title).toBe("Updated Task Title")
      expect(result.priority).toBe("urgent")
      expect(loggedActivity.action).toBe("task_updated")
      expect(loggedActivity.entityId).toBe(mockTaskId)
      expect(loggedActivity.details?.title).toBe("Updated Task Title")
    })
  })

  describe("Task Completion & Status Changes", () => {
    it("completes task and logs 'task_completed' when status transitions to done", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Deploy V2 Release",
                    status: "in_progress",
                    priority: "high",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: mockTaskId,
                      organization_id: mockOrgId,
                      title: "Deploy V2 Release",
                      status: "done",
                      priority: "high",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      deleted_at: null,
                    },
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

      const result = await updateTaskStatus(mockTaskId, mockOrgId, mockUserId, "done")

      expect(result.status).toBe("done")
      expect(loggedActivity.action).toBe("task_completed")
      expect(loggedActivity.details?.previous_status).toBe("in_progress")
      expect(loggedActivity.details?.new_status).toBe("done")
    })

    it("logs 'task_status_changed' when transitioning between non-completed statuses", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Architecture Review",
                    status: "todo",
                    priority: "medium",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: mockTaskId,
                      organization_id: mockOrgId,
                      title: "Architecture Review",
                      status: "in_progress",
                      priority: "medium",
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      deleted_at: null,
                    },
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

      const result = await updateTaskStatus(mockTaskId, mockOrgId, mockUserId, "in_progress")

      expect(result.status).toBe("in_progress")
      expect(loggedActivity.action).toBe("task_status_changed")
      expect(loggedActivity.details?.previous_status).toBe("todo")
      expect(loggedActivity.details?.new_status).toBe("in_progress")
    })
  })

  describe("Task Assignment", () => {
    it("assigns task to valid member and logs 'task_assigned'", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(leadsServiceModule, "validateAssigneeMembership").mockResolvedValue(true)
      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Security Audit",
                    assigned_to: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    deleted_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: mockTaskId,
                      organization_id: mockOrgId,
                      title: "Security Audit",
                      assigned_to: mockUserId,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      deleted_at: null,
                    },
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

      const result = await assignTask(mockTaskId, mockOrgId, mockUserId, mockUserId)

      expect(result.assigned_to).toBe(mockUserId)
      expect(loggedActivity.action).toBe("task_assigned")
      expect(loggedActivity.details?.assigned_to).toBe(mockUserId)
    })
  })

  describe("Soft Delete and Restore Workflow", () => {
    it("soft deletes task and logs 'task_deleted'", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Deprecated Task",
                    deleted_at: null,
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                error: null,
              }),
            }),
          }),
        }),
      }

      vi.spyOn(serverClientModule, "createClient").mockResolvedValue(
        mockSupabase as unknown as never
      )

      await softDeleteTask(mockTaskId, mockOrgId, mockUserId)

      expect(loggedActivity.action).toBe("task_deleted")
      expect(loggedActivity.entityId).toBe(mockTaskId)
    })

    it("restores soft-deleted task and logs 'task_restored'", async () => {
      let loggedActivity: MockActivityPayload = {}

      vi.spyOn(activitiesServiceModule, "logActivity").mockImplementation(
        async (payload) => {
          loggedActivity = payload as unknown as MockActivityPayload
        }
      )

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: mockTaskId,
                    organization_id: mockOrgId,
                    title: "Restored Task",
                    deleted_at: "2026-09-01T00:00:00Z",
                  },
                  error: null,
                }),
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: {
                      id: mockTaskId,
                      organization_id: mockOrgId,
                      title: "Restored Task",
                      deleted_at: null,
                    },
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

      const result = await restoreTask(mockTaskId, mockOrgId, mockUserId)

      expect(result.deleted_at).toBeNull()
      expect(loggedActivity.action).toBe("task_restored")
      expect(loggedActivity.entityId).toBe(mockTaskId)
    })
  })
})
