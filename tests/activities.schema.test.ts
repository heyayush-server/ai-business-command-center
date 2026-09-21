import { describe, it, expect } from "vitest"
import {
  createActivitySchema,
  activityFilterSchema,
  ACTIVITY_TYPES_CONFIG,
} from "@/lib/validations/activity.schema"

describe("Activity Validation Schemas", () => {
  const validEntityId = "11111111-1111-4111-8111-111111111111"

  describe("createActivitySchema", () => {
    it("accepts valid input with all manual activity types", () => {
      const allowedTypes = [
        "note",
        "call",
        "email",
        "meeting",
        "follow_up",
        "status_change",
        "task",
        "other",
      ] as const

      allowedTypes.forEach((type) => {
        const result = createActivitySchema.safeParse({
          action: type,
          title: `Test ${type} activity`,
          description: `Detailed information about ${type}`,
          entity_type: "lead",
          entity_id: validEntityId,
        })
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.action).toBe(type)
          expect(result.data.title).toBe(`Test ${type} activity`)
          expect(result.data.entity_type).toBe("lead")
          expect(result.data.entity_id).toBe(validEntityId)
        }
      })
    })

    it("verifies ACTIVITY_TYPES_CONFIG contains all required types with labels", () => {
      expect(ACTIVITY_TYPES_CONFIG.length).toBe(8)
      const types = ACTIVITY_TYPES_CONFIG.map((c) => c.type)
      expect(types).toContain("note")
      expect(types).toContain("call")
      expect(types).toContain("email")
      expect(types).toContain("meeting")
      expect(types).toContain("follow_up")
      expect(types).toContain("status_change")
      expect(types).toContain("task")
      expect(types).toContain("other")
    })

    it("applies default entity_type 'organization' when not specified", () => {
      const result = createActivitySchema.safeParse({
        action: "note",
        title: "General company memo",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.entity_type).toBe("organization")
        expect(result.data.entity_id).toBeNull()
        expect(result.data.description).toBeNull()
      }
    })

    it("transforms empty strings to null for optional description and entity_id", () => {
      const result = createActivitySchema.safeParse({
        action: "call",
        title: "Short sync",
        description: "   ",
        entity_id: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBeNull()
        expect(result.data.entity_id).toBeNull()
      }
    })

    it("rejects missing or empty title", () => {
      const result = createActivitySchema.safeParse({
        action: "note",
        title: "   ",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Activity title is required")
      }
    })

    it("rejects invalid activity type", () => {
      const result = createActivitySchema.safeParse({
        action: "unsupported_action",
        title: "Some action",
      })
      expect(result.success).toBe(false)
    })

    it("rejects non-UUID string for entity_id", () => {
      const result = createActivitySchema.safeParse({
        action: "call",
        title: "Call with client",
        entity_id: "not-a-valid-uuid",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Entity ID must be a valid UUID")
      }
    })
  })

  describe("activityFilterSchema", () => {
    it("applies default pagination and sorting options", () => {
      const result = activityFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(50)
      expect(result.date_filter).toBe("all")
      expect(result.search).toBe("")
    })

    it("transforms 'all' filter selections to undefined", () => {
      const result = activityFilterSchema.parse({
        action: "all",
        entity_type: "all",
        user_id: "all",
      })
      expect(result.action).toBeUndefined()
      expect(result.entity_type).toBeUndefined()
      expect(result.user_id).toBeUndefined()
    })
  })
})
