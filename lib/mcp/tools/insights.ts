/**
 * lib/mcp/tools/insights.ts
 *
 * MCP Business Intelligence & Proactive Insights Tool.
 * Exposes deterministic CRM insights and executive briefings to the AI Business Copilot.
 */

import { tool } from "ai"
import { z } from "zod"
import { getBusinessInsights } from "@/lib/services/insights.service"
import type { MCPContext } from "../context"

export function getInsightsTools(context: MCPContext) {
  const { organizationId } = context

  return {
    get_business_insights: tool({
      description:
        "Retrieve proactive, organization-scoped business intelligence insights, anomalies, overdue tasks, stale leads/deals, and operational risks. Always use this tool when the user asks 'What needs my attention?', 'Show me risky deals', 'Which leads need follow-up?', 'Are there overdue tasks?', or requests an operational briefing.",
      inputSchema: z.object({
        severity: z
          .enum(["all", "critical", "warning", "info"])
          .optional()
          .default("all")
          .describe("Filter insights by severity level ('critical', 'warning', 'info', or 'all')."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .default(20)
          .describe("Maximum number of insights to return (1-50)."),
        entity_type: z
          .enum(["all", "task", "lead", "deal", "customer", "pipeline", "activity", "organization"])
          .optional()
          .default("all")
          .describe("Optionally filter insights by affected entity type."),
      }),
      execute: async ({ severity, limit, entity_type }) => {
        const result = await getBusinessInsights(organizationId, {
          severity: severity === "all" ? "all" : severity,
          limit,
        })

        let filteredInsights = result.insights
        if (entity_type && entity_type !== "all") {
          filteredInsights = filteredInsights.filter((i) => i.entityType === entity_type)
        }

        return {
          briefing: result.briefing,
          insights: filteredInsights.map((i) => ({
            id: i.id,
            type: i.type,
            severity: i.severity,
            title: i.title,
            description: i.description,
            entityType: i.entityType,
            entityId: i.entityId,
            recommendedAction: i.recommendedAction?.label ?? null,
            metadata: i.metadata ?? {},
          })),
          total: filteredInsights.length,
        }
      },
    }),
  }
}
