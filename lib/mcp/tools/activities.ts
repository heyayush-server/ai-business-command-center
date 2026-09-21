import { tool } from "ai"
import { z } from "zod"
import { validateEntityBelongsToOrg, getActivities } from "@/lib/services/activities.service"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import type { MCPContext } from "../context"

export function getActivitiesTools(context: MCPContext) {
  const { organizationId, userId, role, conversationId } = context

  return {
    get_recent_activities: tool({
      description: "Retrieve audit activity timeline logs, optionally filtered by entity type or a specific entity ID.",
      inputSchema: z.object({
        entity_type: z
          .enum(["lead", "customer", "deal", "task", "organization", "general"])
          .optional()
          .describe("Filter by entity type"),
        entity_id: z.string().uuid().optional().describe("UUID of specific entity"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum activity events to retrieve"),
      }),
      execute: async ({ entity_type, entity_id, limit }) => {
        if (entity_id && entity_type && entity_type !== "organization" && entity_type !== "general") {
          const isValid = await validateEntityBelongsToOrg(entity_type, entity_id, organizationId)
          if (!isValid) {
            return {
              error: `Specified ${entity_type} not found or does not belong to your organization`,
              activities: [],
            }
          }
        }

        const res = await getActivities(
          {
            entity_type,
            pageSize: limit,
          },
          organizationId
        )

        let filtered = res.activities
        if (entity_id) {
          filtered = filtered.filter((a) => a.entity_id === entity_id)
        }

        return {
          count: filtered.length,
          activities: filtered.slice(0, limit).map((a) => ({
            id: a.id,
            action: a.action,
            title: a.title,
            description: a.description,
            actorType: a.actor_type,
            actorName:
              a.actor_type === "ai"
                ? "AI Assistant"
                : a.actor?.full_name || a.actor?.email || "Team Member",
            linkedEntity: a.linked_entity
              ? { name: a.linked_entity.name, type: a.linked_entity.type }
              : null,
            created_at: a.created_at,
          })),
        }
      },
    }),

    prepare_record_activity: tool({
      description: "Prepare a Record Activity action for human approval. Does NOT log the activity immediately. Use when the user asks to log a call, note, meeting, or custom event.",
      inputSchema: z.object({
        entity_type: z.enum(["lead", "customer", "deal", "task", "general"]).describe("The type of entity this activity relates to"),
        entity_id: z.string().uuid().optional().describe("Optional ID of the specific entity"),
        action: z.string().trim().min(1).max(100).describe("Action verb, e.g. 'call', 'meeting', 'note'"),
        title: z.string().trim().min(1).max(200).describe("Short descriptive title of the activity"),
        description: z.string().trim().max(5000).optional().describe("Detailed description"),
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
            actionType: "record_activity",
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
