import { describe, it, expect } from "vitest"
import {
  createDealSchema,
  updateDealSchema,
  changeDealStageSchema,
  assignDealSchema,
  dealFilterSchema,
} from "@/lib/validations/deal.schema"

describe("Deal Validation Schemas", () => {
  const validCustomerId = "11111111-1111-4111-8111-111111111111"
  const validUserId = "22222222-2222-4222-8222-222222222222"
  const validDealId = "33333333-3333-4333-8333-333333333333"

  describe("createDealSchema", () => {
    it("accepts valid input with all fields", () => {
      const input = {
        title: "Enterprise Cloud Infrastructure Agreement",
        customer_id: validCustomerId,
        stage: "proposal" as const,
        value: 75000,
        currency: "usd",
        expected_close: "2026-12-15",
        assigned_to: validUserId,
        notes: "Key decision maker is the CTO. Legal review in progress.",
      }

      const result = createDealSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Enterprise Cloud Infrastructure Agreement")
        expect(result.data.customer_id).toBe(validCustomerId)
        expect(result.data.stage).toBe("proposal")
        expect(result.data.value).toBe(75000)
        expect(result.data.currency).toBe("USD") // transforms to uppercase
        expect(result.data.expected_close).toBe("2026-12-15")
        expect(result.data.assigned_to).toBe(validUserId)
        expect(result.data.notes).toContain("Key decision maker")
      }
    })

    it("accepts minimal required fields and applies defaults", () => {
      const input = {
        title: "Standard Subscription",
        customer_id: validCustomerId,
      }

      const result = createDealSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe("Standard Subscription")
        expect(result.data.customer_id).toBe(validCustomerId)
        expect(result.data.stage).toBe("discovery") // default
        expect(result.data.value).toBe(0) // default
        expect(result.data.currency).toBe("USD") // default
        expect(result.data.expected_close).toBeNull()
        expect(result.data.assigned_to).toBeNull()
        expect(result.data.notes).toBeNull()
      }
    })

    it("rejects missing or empty deal title", () => {
      const result = createDealSchema.safeParse({
        title: "   ",
        customer_id: validCustomerId,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Deal title is required")
      }
    })

    it("rejects title exceeding 150 characters", () => {
      const longTitle = "A".repeat(151)
      const result = createDealSchema.safeParse({
        title: longTitle,
        customer_id: validCustomerId,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("cannot exceed 150 characters")
      }
    })

    it("enforces valid customer_id UUID (each deal must belong to a customer)", () => {
      const resultMissing = createDealSchema.safeParse({
        title: "Orphan Deal",
      })
      expect(resultMissing.success).toBe(false)

      const resultInvalidUuid = createDealSchema.safeParse({
        title: "Orphan Deal",
        customer_id: "not-a-valid-uuid",
      })
      expect(resultInvalidUuid.success).toBe(false)
    })

    it("rejects negative deal values", () => {
      const result = createDealSchema.safeParse({
        title: "Refund Deal",
        customer_id: validCustomerId,
        value: -100,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Value must be zero or greater")
      }
    })

    it("enforces valid expected_close date format YYYY-MM-DD", () => {
      const resultBadDate = createDealSchema.safeParse({
        title: "Bad Date Deal",
        customer_id: validCustomerId,
        expected_close: "15/12/2026",
      })
      expect(resultBadDate.success).toBe(false)

      const resultGoodDate = createDealSchema.safeParse({
        title: "Good Date Deal",
        customer_id: validCustomerId,
        expected_close: "2026-12-15",
      })
      expect(resultGoodDate.success).toBe(true)
    })

    it("allows valid deal stages and rejects unrecognized stages", () => {
      const validStages = [
        "discovery",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ] as const

      for (const st of validStages) {
        const res = createDealSchema.safeParse({
          title: "Test Deal",
          customer_id: validCustomerId,
          stage: st,
        })
        expect(res.success).toBe(true)
      }

      const invalidStage = createDealSchema.safeParse({
        title: "Test Deal",
        customer_id: validCustomerId,
        stage: "pipeline",
      })
      expect(invalidStage.success).toBe(false)
    })
  })

  describe("updateDealSchema", () => {
    it("validates required deal id and allows partial field updates", () => {
      const result = updateDealSchema.safeParse({
        id: validDealId,
        value: 120000,
        stage: "negotiation",
      })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(validDealId)
        expect(result.data.value).toBe(120000)
        expect(result.data.stage).toBe("negotiation")
      }
    })

    it("rejects update missing deal id", () => {
      const result = updateDealSchema.safeParse({
        value: 120000,
      })
      expect(result.success).toBe(false)
    })
  })

  describe("changeDealStageSchema", () => {
    it("validates deal id and valid new stage", () => {
      const result = changeDealStageSchema.safeParse({
        id: validDealId,
        stage: "closed_won",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid stage values", () => {
      const result = changeDealStageSchema.safeParse({
        id: validDealId,
        stage: "won",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("assignDealSchema", () => {
    it("accepts valid UUID or unassigned null", () => {
      const resAssigned = assignDealSchema.safeParse({
        id: validDealId,
        assigned_to: validUserId,
      })
      expect(resAssigned.success).toBe(true)

      const resUnassigned = assignDealSchema.safeParse({
        id: validDealId,
        assigned_to: null,
      })
      expect(resUnassigned.success).toBe(true)
      if (resUnassigned.success) {
        expect(resUnassigned.data.assigned_to).toBeNull()
      }
    })
  })

  describe("dealFilterSchema", () => {
    it("applies defaults for pagination, sorting and soft deletes", () => {
      const result = dealFilterSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.pageSize).toBe(50)
        expect(result.data.sortBy).toBe("created_at")
        expect(result.data.sortOrder).toBe("desc")
        expect(result.data.includeDeleted).toBe(false)
      }
    })

    it("parses includeDeleted string as boolean true", () => {
      const result = dealFilterSchema.safeParse({
        includeDeleted: "true",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.includeDeleted).toBe(true)
      }
    })
  })
})
