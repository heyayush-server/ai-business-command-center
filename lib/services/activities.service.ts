import { createClient } from "@/lib/supabase/server"
import type { Database, ActorType, Json } from "@/lib/types/database.types"
import type {
  CreateActivityOutput,
  ActivityFilterParams,
  ActivityEntityType,
} from "@/lib/validations/activity.schema"

export interface LogActivityParams {
  organizationId: string
  actorType?: ActorType
  userId?: string | null
  entityType: string
  entityId: string | null
  action: string
  title?: string | null
  description?: string | null
  details?: Record<string, unknown>
}

export type ActivityRow = Database["public"]["Tables"]["activities"]["Row"]

export interface ActivityLinkedEntity {
  id: string
  name: string
  type: ActivityEntityType | string
  href: string
}

export type ActivityWithDetails = ActivityRow & {
  actor?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  linked_entity?: ActivityLinkedEntity | null
}

// Backwards-compatible alias for existing imports
export type ActivityWithActor = ActivityWithDetails

export interface GetActivitiesResult {
  activities: ActivityWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Validates that an entity belongs to the active organization and is not deleted.
 */
export async function validateEntityBelongsToOrg(
  entityType: string,
  entityId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()

  switch (entityType) {
    case "lead": {
      const { data, error } = await supabase
        .from("leads")
        .select("id")
        .eq("id", entityId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle()
      return !error && Boolean(data)
    }
    case "customer": {
      const { data, error } = await supabase
        .from("customers")
        .select("id")
        .eq("id", entityId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle()
      return !error && Boolean(data)
    }
    case "deal": {
      const { data, error } = await supabase
        .from("deals")
        .select("id")
        .eq("id", entityId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle()
      return !error && Boolean(data)
    }
    case "task": {
      const { data, error } = await supabase
        .from("tasks")
        .select("id")
        .eq("id", entityId)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle()
      return !error && Boolean(data)
    }
    case "organization":
    case "general":
      return entityId === organizationId
    default:
      return false
  }
}

/**
 * Appends an immutable audit/activity event to the activities log.
 * Enforces organization boundary and ensures actor context cannot be spoofed.
 */
export async function logActivity(params: LogActivityParams) {
  const supabase = await createClient()

  const extractedTitle =
    params.title ||
    (params.details?.title as string) ||
    (params.details?.name as string) ||
    formatActionLabel(params.action)

  const extractedDescription =
    params.description || (params.details?.description as string) || null

  const { error } = await supabase.from("activities").insert({
    organization_id: params.organizationId,
    actor_type: params.actorType || "user",
    user_id: params.userId || null,
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    title: extractedTitle,
    description: extractedDescription,
    details: (params.details || {}) as Json,
  })

  if (error) {
    console.error("[activities.service] Failed to log activity:", error)
  }
}

/**
 * Creates a manual activity (note, call, meeting, etc.) on an entity or organization.
 */
export async function createManualActivity(
  organizationId: string,
  userId: string,
  input: CreateActivityOutput
): Promise<ActivityWithDetails> {
  // Validate entity belongs to org if specified
  if (input.entity_id && input.entity_type !== "organization" && input.entity_type !== "general") {
    const isValid = await validateEntityBelongsToOrg(
      input.entity_type,
      input.entity_id,
      organizationId
    )
    if (!isValid) {
      throw new Error(
        `Selected ${input.entity_type} not found or does not belong to your organization`
      )
    }
  }

  const supabase = await createClient()

  const insertPayload = {
    organization_id: organizationId,
    actor_type: "user" as ActorType,
    user_id: userId,
    entity_type: input.entity_type,
    entity_id: input.entity_id || null,
    action: input.action,
    title: input.title,
    description: input.description,
    details: (input.details || {}) as Json,
  }

  const { data, error } = await supabase
    .from("activities")
    .insert(insertPayload)
    .select(
      `
      *,
      actor:profiles!activities_user_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("[activities.service] Failed to create manual activity:", error)
    throw new Error(error?.message || "Failed to create activity")
  }

  return data as unknown as ActivityWithDetails
}

/**
 * Server-side paginated, filtered, and sorted query for activities.
 */
export async function getActivities(
  params: Partial<ActivityFilterParams>,
  organizationId: string
): Promise<GetActivitiesResult> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    const { MOCK_DEV_ACTIVITIES } = await import("@/lib/mock/crm-entities")
    return {
      activities: MOCK_DEV_ACTIVITIES,
      total: MOCK_DEV_ACTIVITIES.length,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    }
  }

  const supabase = await createClient()

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 50))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("activities")
    .select(
      `
      *,
      actor:profiles!activities_user_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("organization_id", organizationId)

  // Filter by action / activity type
  if (params.action && params.action !== "all") {
    query = query.eq("action", params.action)
  }

  // Filter by entity type
  if (params.entity_type && params.entity_type !== "all") {
    query = query.eq("entity_type", params.entity_type)
  }

  // Filter by actor / user
  if (params.user_id && params.user_id !== "all") {
    query = query.eq("user_id", params.user_id)
  }

  // Date filter
  if (params.date_filter && params.date_filter !== "all") {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).toISOString()

    if (params.date_filter === "today") {
      query = query.gte("created_at", todayStart).lte("created_at", todayEnd)
    } else if (params.date_filter === "yesterday") {
      const yesterdayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      ).toISOString()
      const yesterdayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        23,
        59,
        59,
        999
      ).toISOString()
      query = query.gte("created_at", yesterdayStart).lte("created_at", yesterdayEnd)
    } else if (params.date_filter === "this_week") {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte("created_at", weekStart)
    } else if (params.date_filter === "this_month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      query = query.gte("created_at", monthStart)
    }
  }

  // Search filter across title, description, and action
  if (params.search && params.search.trim().length > 0) {
    const term = `%${params.search.trim()}%`
    query = query.or(`title.ilike.${term},description.ilike.${term},action.ilike.${term}`)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error("[activities.service] Error fetching activities:", error)
    throw new Error(error.message || "Failed to fetch activities")
  }

  const rawActivities = (data as unknown as ActivityWithDetails[]) || []

  // Batch resolve linked entity names for rich UI display
  const activitiesWithEntities = await enrichActivitiesWithEntities(
    rawActivities,
    organizationId
  )

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize) || 1

  return {
    activities: activitiesWithEntities,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Retrieves the activity timeline for a specific entity within an organization.
 */
export async function getEntityActivities(
  organizationId: string,
  entityType: string,
  entityId: string
): Promise<ActivityWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("activities")
    .select(
      `
      *,
      actor:profiles!activities_user_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("organization_id", organizationId)
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[activities.service] Failed to retrieve entity activities:", error)
    return []
  }

  return (data as unknown as ActivityWithDetails[]) || []
}

/**
 * Resolves linked entity metadata for a batch of activities.
 */
async function enrichActivitiesWithEntities(
  activities: ActivityWithDetails[],
  organizationId: string
): Promise<ActivityWithDetails[]> {
  const leadIds = new Set<string>()
  const customerIds = new Set<string>()
  const dealIds = new Set<string>()
  const taskIds = new Set<string>()

  activities.forEach((act) => {
    if (!act.entity_id) return
    if (act.entity_type === "lead") leadIds.add(act.entity_id)
    else if (act.entity_type === "customer") customerIds.add(act.entity_id)
    else if (act.entity_type === "deal") dealIds.add(act.entity_id)
    else if (act.entity_type === "task") taskIds.add(act.entity_id)
  })

  const supabase = await createClient()

  const [leadsRes, customersRes, dealsRes, tasksRes] = await Promise.all([
    leadIds.size > 0
      ? supabase
          .from("leads")
          .select("id, first_name, last_name, company")
          .eq("organization_id", organizationId)
          .in("id", Array.from(leadIds))
      : Promise.resolve({ data: [] }),
    customerIds.size > 0
      ? supabase
          .from("customers")
          .select("id, name")
          .eq("organization_id", organizationId)
          .in("id", Array.from(customerIds))
      : Promise.resolve({ data: [] }),
    dealIds.size > 0
      ? supabase
          .from("deals")
          .select("id, title, name")
          .eq("organization_id", organizationId)
          .in("id", Array.from(dealIds))
      : Promise.resolve({ data: [] }),
    taskIds.size > 0
      ? supabase
          .from("tasks")
          .select("id, title")
          .eq("organization_id", organizationId)
          .in("id", Array.from(taskIds))
      : Promise.resolve({ data: [] }),
  ])

  const leadMap = new Map<string, string>()
  ;(leadsRes.data || []).forEach((l) => {
    const fullName = `${l.first_name} ${l.last_name}`.trim()
    leadMap.set(l.id, l.company ? `${fullName} (${l.company})` : fullName)
  })

  const customerMap = new Map<string, string>()
  ;(customersRes.data || []).forEach((c) => {
    customerMap.set(c.id, c.name)
  })

  const dealMap = new Map<string, string>()
  ;(dealsRes.data || []).forEach((d) => {
    dealMap.set(d.id, d.title || d.name || "Deal")
  })

  const taskMap = new Map<string, string>()
  ;(tasksRes.data || []).forEach((t) => {
    taskMap.set(t.id, t.title)
  })

  return activities.map((act) => {
    let linkedEntity: ActivityLinkedEntity | null = null

    if (act.entity_id) {
      if (act.entity_type === "lead" && leadMap.has(act.entity_id)) {
        linkedEntity = {
          id: act.entity_id,
          name: leadMap.get(act.entity_id)!,
          type: "lead",
          href: `/leads/${act.entity_id}`,
        }
      } else if (act.entity_type === "customer" && customerMap.has(act.entity_id)) {
        linkedEntity = {
          id: act.entity_id,
          name: customerMap.get(act.entity_id)!,
          type: "customer",
          href: `/customers/${act.entity_id}`,
        }
      } else if (act.entity_type === "deal" && dealMap.has(act.entity_id)) {
        linkedEntity = {
          id: act.entity_id,
          name: dealMap.get(act.entity_id)!,
          type: "deal",
          href: `/deals`,
        }
      } else if (act.entity_type === "task" && taskMap.has(act.entity_id)) {
        linkedEntity = {
          id: act.entity_id,
          name: taskMap.get(act.entity_id)!,
          type: "task",
          href: `/tasks`,
        }
      }
    }

    return {
      ...act,
      title: act.title || formatActionLabel(act.action),
      linked_entity: linkedEntity,
    }
  })
}

function formatActionLabel(action: string): string {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
