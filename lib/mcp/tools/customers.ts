import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import type { MCPContext } from "../context"

export function getCustomersTools(context: MCPContext) {
  const { organizationId, userId, role, conversationId } = context

  return {
    search_customers: tool({
      description: "Search customer accounts by name, primary contact name, email, or industry.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search term for customer name, contact name, email, or industry"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum customers to retrieve"),
      }),
      execute: async ({ query, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("customers")
          .select("id, name, industry, status, primary_contact_name, primary_contact_email, converted_from_lead_id, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (query && query.length > 0) {
          const term = `%${query}%`
          q = q.or(`name.ilike.${term},primary_contact_name.ilike.${term},primary_contact_email.ilike.${term},industry.ilike.${term}`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[MCP:search_customers] Error:", error)
          return { error: "Failed to search customers", customers: [] }
        }

        return {
          count: data.length,
          customers: data.map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry,
            status: c.status,
            contactName: c.primary_contact_name,
            contactEmail: c.primary_contact_email,
            convertedFromLead: Boolean(c.converted_from_lead_id),
            created_at: c.created_at.slice(0, 10),
          })),
        }
      },
    }),

    get_customers: tool({
      description: "List customer accounts.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum customers to retrieve"),
      }),
      execute: async ({ limit }) => {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from("customers")
          .select("id, name, industry, status, primary_contact_name, primary_contact_email, converted_from_lead_id, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (error) {
          console.error("[MCP:get_customers] Error:", error)
          return { error: "Failed to retrieve customers", customers: [] }
        }

        return {
          count: data.length,
          customers: data.map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry,
            status: c.status,
            contactName: c.primary_contact_name,
            contactEmail: c.primary_contact_email,
            convertedFromLead: Boolean(c.converted_from_lead_id),
            created_at: c.created_at.slice(0, 10),
          })),
        }
      },
    }),

    prepare_create_customer: tool({
      description: "Prepare a Create Customer action for human approval. Does NOT create the customer immediately. Use when the user asks to add a new customer or client account.",
      inputSchema: z.object({
        name: z.string().trim().min(1).max(200).describe("Customer/company name"),
        industry: z.string().trim().max(100).optional().describe("Industry"),
        primary_contact_name: z.string().trim().max(200).optional().describe("Primary contact person"),
        primary_contact_email: z.string().email().optional().describe("Contact email"),
        primary_contact_phone: z.string().trim().max(30).optional().describe("Contact phone"),
        notes: z.string().trim().max(5000).optional().describe("Notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "create_customer",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_customer: tool({
      description: "Prepare an Update Customer action for human approval. Does NOT update the customer immediately.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The customer ID to update"),
        name: z.string().trim().max(200).optional(),
        industry: z.string().trim().max(100).optional(),
        status: z.enum(["active", "inactive", "churned"]).optional(),
        primary_contact_name: z.string().trim().max(200).optional(),
        primary_contact_email: z.string().email().optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: cust } = await supabase
          .from("customers")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!cust) return { error: "Customer not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "update_customer",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),
  }
}
