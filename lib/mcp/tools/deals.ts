import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import { getDashboardData } from "@/lib/services/dashboard.service"
import type { DealStage } from "@/lib/types/database.types"
import type { MCPContext } from "../context"

export function getDealsTools(context: MCPContext) {
  const { organizationId, userId, role, conversationId } = context

  return {
    search_deals: tool({
      description: "Search and filter deals by title and/or sales stage.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search text for deal title"),
        stage: z
          .enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"])
          .optional()
          .describe("Filter by deal stage"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum deals to retrieve"),
      }),
      execute: async ({ query, stage, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("deals")
          .select("id, title, stage, value, currency, expected_close, customer:customers(id, name), created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (stage) {
          q = q.eq("stage", stage as DealStage)
        }

        if (query && query.length > 0) {
          q = q.ilike("title", `%${query}%`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[MCP:search_deals] Error:", error)
          return { error: "Failed to search deals", deals: [] }
        }

        return {
          count: data.length,
          deals: data.map((d) => {
            const cust = Array.isArray(d.customer) ? d.customer[0] : d.customer
            return {
              id: d.id,
              title: d.title,
              stage: d.stage,
              value: Number(d.value) || 0,
              currency: d.currency || "USD",
              customerName: cust?.name || null,
              expectedClose: d.expected_close ? d.expected_close.slice(0, 10) : null,
              created_at: d.created_at.slice(0, 10),
            }
          }),
        }
      },
    }),

    get_deals: tool({
      description: "List deals optionally filtered by sales stage.",
      inputSchema: z.object({
        stage: z
          .enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"])
          .optional()
          .describe("Filter by deal stage"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum deals to retrieve"),
      }),
      execute: async ({ stage, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("deals")
          .select("id, title, stage, value, currency, expected_close, customer:customers(id, name), created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (stage) {
          q = q.eq("stage", stage as DealStage)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[MCP:get_deals] Error:", error)
          return { error: "Failed to retrieve deals", deals: [] }
        }

        return {
          count: data.length,
          deals: data.map((d) => {
            const cust = Array.isArray(d.customer) ? d.customer[0] : d.customer
            return {
              id: d.id,
              title: d.title,
              stage: d.stage,
              value: Number(d.value) || 0,
              currency: d.currency || "USD",
              customerName: cust?.name || null,
              expectedClose: d.expected_close ? d.expected_close.slice(0, 10) : null,
              created_at: d.created_at.slice(0, 10),
            }
          }),
        }
      },
    }),

    get_pipeline: tool({
      description: "Get the complete sales pipeline breakdown by stage: deal volume, stage total value, and active pipeline value.",
      inputSchema: z.object({}),
      execute: async () => {
        const data = await getDashboardData(organizationId)
        return {
          totalPipelineValue: data.pipeline.totalValue,
          totalDeals: data.pipeline.totalDeals,
          stages: data.pipeline.stages.map((s) => ({
            stage: s.stage,
            label: s.label,
            count: s.count,
            totalValue: s.totalValue,
            percentageOfPipeline: `${s.percentage}%`,
          })),
        }
      },
    }),

    prepare_create_deal: tool({
      description: "Prepare a Create Deal action for human approval. Does NOT create the deal immediately. Requires a customer_id. Use when the user asks to add a new deal or opportunity.",
      inputSchema: z.object({
        title: z.string().trim().min(1).max(200).describe("Deal title"),
        customer_id: z.string().uuid().describe("The customer this deal belongs to"),
        stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).optional().default("discovery").describe("Initial stage"),
        value: z.number().min(0).optional().default(0).describe("Deal value in the given currency"),
        currency: z.string().length(3).optional().default("USD").describe("3-letter currency code"),
        expected_close: z.string().optional().describe("Expected close date YYYY-MM-DD"),
        notes: z.string().trim().max(5000).optional().describe("Notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: cust } = await supabase
          .from("customers")
          .select("id")
          .eq("id", input.customer_id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!cust) return { error: "Customer not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "create_deal",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_deal: tool({
      description: "Prepare an Update Deal action for human approval. Does NOT update the deal immediately. Use when the user asks to change a deal's stage, value, or details.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The deal ID to update"),
        title: z.string().trim().max(200).optional(),
        stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        value: z.number().min(0).optional(),
        currency: z.string().length(3).optional(),
        expected_close: z.string().optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: deal } = await supabase
          .from("deals")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!deal) return { error: "Deal not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
            actionType: "update_deal",
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
