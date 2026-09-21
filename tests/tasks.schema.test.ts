import { describe, it, expect } from "vitest"
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  taskFilterSchema,
} from "@/lib/validations/task.schema"

describe("Task Validation Schemas", () => {
  const validUserId = "11111111-1111-4111-8111-111111111111"
  const validLeadId = "22222222-2222-4222-8222-222222222222"
  const validCustomerId = "33333333-3333-4333-8333-333333333333"
  const validDealId = "44444444-4444-4444-8444-444444444444"
  const validTaskId = "55555555-5555-4555-8555-555555555555"

  describe("createTaskSchema", () => {
    it("accepts valid input with all fields populated", () => {
      const input = {
        title: "Finalize Quarterly Review Slide Deck",
        description: "Review KPIs and compile deliverables for the board presentation.",
        status: "in_progress" as const,
        priority: "high" as const,
        due_date: "2026-10-15T12:00:00.000Z",
        assigned_to: validUserId,
        lead_id: validLeadId,
        customer_id: validCustomerId,
        deal_id: validDealId,
      }

      const result = createTaskSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Finalize Quarterly Review Slide Deck")
        expect(result.data.description).toContain("Review KPIs")
        expect(result.data.status).toBe("in_progress")
        expect(result.data.priority).toBe("high")
        expect(result.data.due_date).toBe("2026-10-15T12:00:00.000Z")
        expect(result.data.assigned_to).toBe(validUserId)
        expect(result.data.lead_id).toBe(validLeadId)
        expect(result.data.customer_id).toBe(validCustomerId)
        expect(result.data.deal_id).toBe(validDealId)
      }
    })

    it("accepts minimal required title and applies correct defaults", () => {
      const input = {
        title: "Follow up with client",
      }

      const result = createTaskSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Follow up with client")
        expect(result.data.status).toBe("todo")
        expect(result.data.priority).toBe("medium")
        expect(result.data.description).toBeNull()
        expect(result.data.due_date).toBeNull()
        expect(result.data.assigned_to).toBeNull()
        expect(result.data.lead_id).toBeNull()
        expect(result.data.customer_id).toBeNull()
        expect(result.data.deal_id).toBeNull()
      }
    })

    it("transforms empty strings into null for optional linkage and date fields", () => {
      const input = {
        title: "Clean database records",
        description: "",
        due_date: "",
        assigned_to: "",
        lead_id: "",
        customer_id: "",
        deal_id: "",
      }

      const result = createTaskSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeNull()
        expect(result.data.due_date).toBeNull()
        expect(result.data.assigned_to).toBeNull()
        expect(result.data.lead_id).toBeNull()
        expect(result.data.customer_id).toBeNull()
        expect(result.data.deal_id).toBeNull()
      }
    })

    it("rejects empty or whitespace-only title", () => {
      const result = createTaskSchema.safeParse({ title: "   " })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Task title is required")
      }
    })

    it("rejects invalid status value", () => {
      const result = createTaskSchema.safeParse({
        title: "Task title",
        status: "unknown_status",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid priority value", () => {
      const result = createTaskSchema.safeParse({
        title: "Task title",
        priority: "critical", // invalid enum, valid are low, medium, high, urgent
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-UUID strings for relational foreign keys", () => {
      const invalidLead = createTaskSchema.safeParse({
        title: "Task title",
        lead_id: "not-a-uuid",
      })
      expect(invalidLead.success).toBe(false)

      const invalidCustomer = createTaskSchema.safeParse({
        title: "Task title",
        customer_id: "invalid-customer-id",
      })
      expect(invalidCustomer.success).toBe(false)

      const invalidDeal = createTaskSchema.safeParse({
        title: "Task title",
        deal_id: "bad-deal-id",
      })
      expect(invalidDeal.success).toBe(false)

      const invalidAssignee = createTaskSchema.safeParse({
        title: "Task title",
        assigned_to: "bad-user-id",
      })
      expect(invalidAssignee.success).toBe(false)
    })
  })

  describe("updateTaskSchema", () => {
    it("requires a valid task ID and allows partial updates", () => {
      const input = {
        id: validTaskId,
        title: "Updated Title",
        priority: "urgent" as const,
      }

      const result = updateTaskSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(validTaskId)
        expect(result.data.title).toBe("Updated Title")
        expect(result.data.priority).toBe("urgent")
      }
    })

    it("rejects missing or invalid task ID", () => {
      const result = updateTaskSchema.safeParse({
        title: "New Title",
      })
      expect(result.success).toBe(false)

      const badIdResult = updateTaskSchema.safeParse({
        id: "not-a-uuid",
        title: "New Title",
      })
      expect(badIdResult.success).toBe(false)
    })
  })

  describe("updateTaskStatusSchema", () => {
    it("validates task ID and status transition", () => {
      const result = updateTaskStatusSchema.safeParse({
        id: validTaskId,
        status: "done",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe("done")
      }
    })

    it("rejects invalid status", () => {
      const result = updateTaskStatusSchema.safeParse({
        id: validTaskId,
        status: "completed", // schema enum is 'done'
      })
      expect(result.success).toBe(false)
    })
  })

  describe("assignTaskSchema", () => {
    it("accepts valid assignee UUID", () => {
      const result = assignTaskSchema.safeParse({
        id: validTaskId,
        assigned_to: validUserId,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.assigned_to).toBe(validUserId)
      }
    })

    it("accepts null or empty string to unassign task", () => {
      const nullResult = assignTaskSchema.safeParse({
        id: validTaskId,
        assigned_to: null,
      })
      expect(nullResult.success).toBe(true)
      if (nullResult.success) {
        expect(nullResult.data.assigned_to).toBeNull()
      }

      const emptyResult = assignTaskSchema.safeParse({
        id: validTaskId,
        assigned_to: "",
      })
      expect(emptyResult.success).toBe(true)
      if (emptyResult.success) {
        expect(emptyResult.data.assigned_to).toBeNull()
      }
    })
  })

  describe("taskFilterSchema", () => {
    it("applies default pagination and sorting options", () => {
      const result = taskFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(50)
      expect(result.sortBy).toBe("created_at")
      expect(result.sortOrder).toBe("desc")
      expect(result.due_date_filter).toBe("all")
      expect(result.includeDeleted).toBe(false)
    })

    it("transforms 'all' filter params to undefined", () => {
      const result = taskFilterSchema.parse({
        status: "all",
        priority: "all",
        assigned_to: "all",
      })
      expect(result.status).toBeUndefined()
      expect(result.priority).toBeUndefined()
      expect(result.assigned_to).toBeUndefined()
    })

    it("parses string booleans for includeDeleted", () => {
      const trueResult = taskFilterSchema.parse({ includeDeleted: "true" })
      expect(trueResult.includeDeleted).toBe(true)

      const falseResult = taskFilterSchema.parse({ includeDeleted: "false" })
      expect(falseResult.includeDeleted).toBe(false)
    })
  })
})
