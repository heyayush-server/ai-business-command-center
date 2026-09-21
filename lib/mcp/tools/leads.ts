import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import type { LeadStatus } from "@/lib/types/database.types"
import type { MCPContext } from "../context"

export function getLeadsTools(context: MCPContext) {
  const { organizationId, userId, role, conversationId } = context

  return {
    search_leads: tool({
      description: "Search and filter leads by text query (name, email, company) and/or lead status.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search term for first name, last name, email, or company"),
        status: z
          .enum(["new", "contacted", "qualifying", "qualified", "lost"])
          .optional()
          .describe("Filter by lead status"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of leads to return (max 50)"),
      }),
      execute: async ({ query, status, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("leads")
          .select("id, first_name, last_name, email, company, status, source, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (status) {
          q = q.eq("status", status as LeadStatus)
        }

        if (query && query.length > 0) {
          const term = `%${query}%`
          q = q.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[MCP:search_leads] Error:", error)
          return { error: "Failed to search leads", leads: [] }
        }

        return {
          count: data.length,
          leads: data.map((l) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name}`.trim(),
            email: l.email,
            company: l.company,
            status: l.status,
            source: l.source,
            created_at: l.created_at.slice(0, 10),
          })),
        }
      },
    }),

    get_leads: tool({
      description: "List leads optionally filtered by status.",
      inputSchema: z.object({
        status: z
          .enum(["new", "contacted", "qualifying", "qualified", "lost"])
          .optional()
          .describe("Filter by status"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum leads to retrieve"),
      }),
      execute: async ({ status, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("leads")
          .select("id, first_name, last_name, email, company, status, source, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (status) {
          q = q.eq("status", status as LeadStatus)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[MCP:get_leads] Error:", error)
          return { error: "Failed to retrieve leads", leads: [] }
        }

        return {
          count: data.length,
          leads: data.map((l) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name}`.trim(),
            email: l.email,
            company: l.company,
            status: l.status,
            source: l.source,
            created_at: l.created_at.slice(0, 10),
          })),
        }
      },
    }),

    prepare_create_lead: tool({
      description: "Prepare a Create Lead action for human approval. Does NOT create the lead immediately. Use when the user asks to add, create, or register a new lead/prospect.",
      inputSchema: z.object({
        first_name: z.string().trim().min(1).max(100).describe("Lead first name"),
        last_name: z.string().trim().min(1).max(100).describe("Lead last name"),
        email: z.string().email().optional().describe("Email address"),
        company: z.string().trim().max(200).optional().describe("Company name"),
        phone: z.string().trim().max(30).optional().describe("Phone number"),
        source: z.string().trim().max(100).optional().describe("Lead source"),
        status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).optional().default("new").describe("Initial status"),
        notes: z.string().trim().max(5000).optional().describe("Initial notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions: viewer accounts cannot prepare write actions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "create_lead",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_lead: tool({
      description: "Prepare an Update Lead action for human approval. Does NOT update the lead immediately. Use when the user asks to change a lead's status, details, or assignment.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The lead ID to update"),
        first_name: z.string().trim().max(100).optional(),
        last_name: z.string().trim().max(100).optional(),
        email: z.string().email().optional(),
        company: z.string().trim().max(200).optional(),
        status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: lead } = await supabase
          .from("leads")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!lead) return { error: "Lead not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "update_lead",
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
