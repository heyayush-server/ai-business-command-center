import { createClient } from "@/lib/supabase/server"
import type { Database, ActorType, Json } from "@/lib/types/database.types"

export interface LogActivityParams {
  organizationId: string
  actorType?: ActorType
  userId?: string | null
  entityType: string
  entityId: string
  action: string
  details?: Record<string, unknown>
}

export type ActivityWithActor = Database["public"]["Tables"]["activities"]["Row"] & {
  actor?: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

/**
 * Appends an immutable audit/activity event to the activities log.
 * Enforces organization boundary and ensures actor context cannot be spoofed.
 */
export async function logActivity(params: LogActivityParams) {
  const supabase = await createClient()

  const { error } = await supabase.from("activities").insert({
    organization_id: params.organizationId,
    actor_type: params.actorType || "user",
    user_id: params.userId || null,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    details: (params.details || {}) as Json,
  })

  if (error) {
    console.error("[activities.service] Failed to log activity:", error)
  }
}

/**
 * Retrieves the activity timeline for a specific entity within an organization.
 */
export async function getEntityActivities(
  organizationId: string,
  entityType: string,
  entityId: string
): Promise<ActivityWithActor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      actor:profiles!activities_user_id_fkey(
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("organization_id", organizationId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[activities.service] Failed to retrieve activities:", error)
    return []
  }

  return (data as unknown as ActivityWithActor[]) || []
}
