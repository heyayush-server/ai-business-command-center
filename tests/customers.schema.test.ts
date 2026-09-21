import { describe, it, expect } from "vitest"
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
  assignCustomerSchema,
  convertLeadToCustomerSchema,
  customerFilterSchema,
} from "@/lib/validations/customer.schema"

describe("Customer Validation Schemas", () => {
  describe("createCustomerSchema", () => {
    it("accepts valid input with all fields", () => {
      const input = {
        name: "Acme Corp",
        industry: "Technology & Software",
        status: "active" as const,
        primary_contact_name: "Sarah Connor",
        primary_contact_email: "sarah@acme.com",
        primary_contact_phone: "+1-555-0100",
        website: "https://acme.com",
        assigned_to: "11111111-1111-4111-8111-111111111111",
      }

      const result = createCustomerSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Acme Corp")
        expect(result.data.industry).toBe("Technology & Software")
        expect(result.data.status).toBe("active")
        expect(result.data.primary_contact_email).toBe("sarah@acme.com")
      }
    })

    it("accepts minimal required fields and applies defaults", () => {
      const input = {
        name: "Globex Corporation",
      }

      const result = createCustomerSchema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("Globex Corporation")
        expect(result.data.status).toBe("active")
        expect(result.data.industry).toBeNull()
        expect(result.data.primary_contact_email).toBeNull()
        expect(result.data.assigned_to).toBeNull()
      }
    })

    it("rejects empty customer name", () => {
      const result = createCustomerSchema.safeParse({ name: "   " })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Customer name is required")
      }
    })

    it("rejects invalid email formats", () => {
      const result = createCustomerSchema.safeParse({
        name: "Initech",
        primary_contact_email: "invalid-email-string",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid email address")
      }
    })

    it("transforms empty strings to null for optional contact details", () => {
      const result = createCustomerSchema.safeParse({
        name: "Umbrella Corp",
        primary_contact_name: "",
        primary_contact_email: "",
        primary_contact_phone: "",
        website: "",
        assigned_to: "",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.primary_contact_name).toBeNull()
        expect(result.data.primary_contact_email).toBeNull()
        expect(result.data.website).toBeNull()
        expect(result.data.assigned_to).toBeNull()
      }
    })
  })

  describe("updateCustomerSchema", () => {
    it("validates update with UUID and partial fields", () => {
      const result = updateCustomerSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        name: "Renamed Corp",
        status: "inactive",
      })
      expect(result.success).toBe(true)
    })

    it("rejects update missing valid UUID", () => {
      const result = updateCustomerSchema.safeParse({
        id: "invalid-id",
        name: "Renamed Corp",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("updateCustomerStatusSchema", () => {
    it("accepts valid customer status", () => {
      const result = updateCustomerStatusSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        status: "churned",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid status", () => {
      const result = updateCustomerStatusSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        status: "closed_won",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("assignCustomerSchema", () => {
    it("accepts valid assigned_to UUID or null", () => {
      const valid = assignCustomerSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        assigned_to: "22222222-2222-4222-8222-222222222222",
      })
      expect(valid.success).toBe(true)

      const unassigned = assignCustomerSchema.safeParse({
        id: "11111111-1111-4111-8111-111111111111",
        assigned_to: null,
      })
      expect(unassigned.success).toBe(true)
    })
  })

  describe("convertLeadToCustomerSchema", () => {
    it("accepts valid lead conversion payload with overrides", () => {
      const result = convertLeadToCustomerSchema.safeParse({
        lead_id: "11111111-1111-4111-8111-111111111111",
        name: "Custom Enterprise Account",
        industry: "Financial Services",
        assigned_to: "22222222-2222-4222-8222-222222222222",
      })
      expect(result.success).toBe(true)
    })

    it("rejects invalid lead_id UUID", () => {
      const result = convertLeadToCustomerSchema.safeParse({
        lead_id: "not-a-valid-uuid",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid lead ID")
      }
    })
  })

  describe("customerFilterSchema", () => {
    it("parses defaults cleanly", () => {
      const result = customerFilterSchema.parse({})
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(10)
      expect(result.sortBy).toBe("created_at")
      expect(result.sortOrder).toBe("desc")
      expect(result.includeDeleted).toBe(false)
      expect(result.status).toBeUndefined()
    })

    it("handles string coercions from URL queries", () => {
      const result = customerFilterSchema.parse({
        page: "2",
        pageSize: "20",
        status: "active",
        includeDeleted: "true",
      })
      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(20)
      expect(result.status).toBe("active")
      expect(result.includeDeleted).toBe(true)
    })
  })
})
