import { describe, it, expect } from "vitest"
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  leadFilterSchema,
} from "@/lib/validations/lead.schema"

describe("Lead Validation Schemas", () => {
  describe("createLeadSchema", () => {
    it("accepts valid input with all fields", () => {
      const input = {
        first_name: "Sarah",
        last_name: "Connor",
        email: "sarah@sky.net",
        phone: "+1-555-0199",
        company: "Cyberdyne Systems",
        status: "qualifying" as const,
        source: "LinkedIn",
        notes: "High value lead with budget confirmed",
        assigned_to: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.first_name).toBe("Sarah")
        expect(result.data.last_name).toBe("Connor")
        expect(result.data.email).toBe("sarah@sky.net")
        expect(result.data.status).toBe("qualifying")
      }
    })

    it("accepts minimal required fields and applies defaults", () => {
      const input = {
        first_name: "Alex",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.first_name).toBe("Alex")
        expect(result.data.last_name).toBe("")
        expect(result.data.status).toBe("new")
        expect(result.data.email).toBeNull()
        expect(result.data.assigned_to).toBeNull()
      }
    })

    it("transforms empty strings to null for nullable fields", () => {
      const input = {
        first_name: "John",
        email: "",
        phone: "",
        company: "",
        source: "",
        notes: "",
        assigned_to: "",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBeNull()
        expect(result.data.phone).toBeNull()
        expect(result.data.company).toBeNull()
        expect(result.data.notes).toBeNull()
        expect(result.data.assigned_to).toBeNull()
      }
    })

    it("rejects missing or empty first_name", () => {
      const input = {
        first_name: "   ",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("First name is required")
      }
    })

    it("rejects invalid email formats", () => {
      const input = {
        first_name: "John",
        email: "not-an-email",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email address")
      }
    })

    it("rejects invalid lead_status values outside the enum", () => {
      const input = {
        first_name: "John",
        status: "non_existent_status",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it("rejects non-UUID assigned_to values", () => {
      const input = {
        first_name: "John",
        assigned_to: "12345-not-uuid",
      }

      const result = createLeadSchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid ID")
      }
    })
  })

  describe("updateLeadSchema", () => {
    it("validates lead update with valid UUID and partial fields", () => {
      const input = {
        id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        status: "qualified" as const,
        company: "Globex Inc",
      }

      const result = updateLeadSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("fails when id is missing or not a valid UUID", () => {
      const input = {
        id: "invalid-id",
        first_name: "Updated",
      }

      const result = updateLeadSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe("updateLeadStatusSchema", () => {
    it("accepts valid status transition", () => {
      const input = {
        id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        status: "lost",
      }

      const result = updateLeadStatusSchema.safeParse(input)
      expect(result.success).toBe(true)
    })

    it("rejects invalid status", () => {
      const input = {
        id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        status: "closed_won",
      }

      const result = updateLeadStatusSchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe("assignLeadSchema", () => {
    it("accepts valid UUID or null for unassignment", () => {
      const assigned = assignLeadSchema.safeParse({
        id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        assigned_to: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
      })
      expect(assigned.success).toBe(true)

      const unassigned = assignLeadSchema.safeParse({
        id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        assigned_to: null,
      })
      expect(unassigned.success).toBe(true)
      if (unassigned.success) {
        expect(unassigned.data.assigned_to).toBeNull()
      }
    })
  })

  describe("leadFilterSchema", () => {
    it("handles defaults cleanly", () => {
      const result = leadFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
      expect(result.sortBy).toBe("created_at")
      expect(result.sortOrder).toBe("desc")
      expect(result.includeDeleted).toBe(false)
      expect(result.status).toBeUndefined()
    })

    it("coerces string queries and booleans properly", () => {
      const result = leadFilterSchema.parse({
        page: "3",
        pageSize: "25",
        status: "contacted",
        includeDeleted: "true",
      })
      expect(result.page).toBe(3)
      expect(result.pageSize).toBe(25)
      expect(result.status).toBe("contacted")
      expect(result.includeDeleted).toBe(true)
    })

    it("transforms 'all' to undefined for database filters", () => {
      const result = leadFilterSchema.parse({
        status: "all",
        source: "all",
        assigned_to: "all",
      })
      expect(result.status).toBeUndefined()
      expect(result.source).toBeUndefined()
      expect(result.assigned_to).toBeUndefined()
    })
  })
})
