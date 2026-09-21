import { createClient } from "@/lib/supabase/server"
import { logActivity } from "@/lib/services/activities.service"
import { validateAssigneeMembership } from "@/lib/services/leads.service"
import type { Database, DealStage } from "@/lib/types/database.types"
import type {
  CreateDealOutput,
  UpdateDealOutput,
  DealFilterParams,
  DealStageType,
} from "@/lib/validations/deal.schema"

export type DealRow = Database["public"]["Tables"]["deals"]["Row"]

export type DealWithDetails = DealRow & {
  customer?: {
    id: string
    name: string
    primary_contact_name: string | null
    primary_contact_email: string | null
  } | null
  assigned_user?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

export interface GetDealsResult {
  deals: DealWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface KanbanStageColumn {
  stage: DealStageType
  label: string
  deals: DealWithDetails[]
  totalValue: number
  count: number
}

export interface KanbanPipelineData {
  columns: Record<DealStageType, KanbanStageColumn>
  totalCount: number
  totalPipelineValue: number
}

export { DEAL_STAGES_CONFIG } from "@/lib/validations/deal.schema"

/**
 * Validates that a customer belongs to the active organization and is not deleted.
 */
export async function validateCustomerBelongsToOrg(
  customerId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle()

  if (error || !data) {
    return false
  }
  return true
}

/**
 * Server-side paginated, filtered, and sorted query for deals.
 */
export async function getDeals(
  params: Partial<DealFilterParams>,
  organizationId: string
): Promise<GetDealsResult> {
  const supabase = await createClient()

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 50))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("deals")
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `,
      { count: "exact" }
    )
    .eq("organization_id", organizationId)

  // Soft delete filter
  if (!params.includeDeleted) {
    query = query.is("deleted_at", null)
  }

  // Filter by stage
  if (params.stage && params.stage !== "all") {
    query = query.eq("stage", params.stage as DealStage)
  }

  // Filter by customer
  if (params.customer_id && params.customer_id !== "all") {
    query = query.eq("customer_id", params.customer_id)
  }

  // Filter by assignee
  if (params.assigned_to && params.assigned_to !== "all") {
    if (params.assigned_to === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", params.assigned_to)
    }
  }

  // Search filter across title and notes
  if (params.search && params.search.trim().length > 0) {
    const term = `%${params.search.trim()}%`
    query = query.or(`title.ilike.${term},notes.ilike.${term}`)
  }

  // Sorting
  const sortBy = params.sortBy || "created_at"
  const ascending = params.sortOrder === "asc"
  query = query.order(sortBy, { ascending })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error("Error fetching deals:", error)
    throw new Error("Failed to retrieve deals")
  }

  const deals = (data || []).map((row) => ({
    ...row,
    title: row.title || row.name,
    expected_close: row.expected_close || row.expected_close_date,
  })) as DealWithDetails[]

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize) || 1

  return {
    deals,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Returns deals structured for the Kanban pipeline board.
 */
export async function getDealsForKanban(
  organizationId: string,
  filters?: {
    search?: string
    assigned_to?: string
    customer_id?: string
    includeDeleted?: boolean
  }
): Promise<KanbanPipelineData> {
  const supabase = await createClient()

  let query = supabase
    .from("deals")
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("organization_id", organizationId)

  if (!filters?.includeDeleted) {
    query = query.is("deleted_at", null)
  }

  if (filters?.customer_id && filters.customer_id !== "all") {
    query = query.eq("customer_id", filters.customer_id)
  }

  if (filters?.assigned_to && filters.assigned_to !== "all") {
    if (filters.assigned_to === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", filters.assigned_to)
    }
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`title.ilike.${term},notes.ilike.${term}`)
  }

  query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching kanban deals:", error)
    throw new Error("Failed to retrieve deals for pipeline")
  }

  const rawDeals = (data || []).map((row) => ({
    ...row,
    title: row.title || row.name,
    expected_close: row.expected_close || row.expected_close_date,
  })) as DealWithDetails[]

  const columns: Record<DealStageType, KanbanStageColumn> = {
    discovery: { stage: "discovery", label: "Discovery", deals: [], totalValue: 0, count: 0 },
    proposal: { stage: "proposal", label: "Proposal", deals: [], totalValue: 0, count: 0 },
    negotiation: { stage: "negotiation", label: "Negotiation", deals: [], totalValue: 0, count: 0 },
    closed_won: { stage: "closed_won", label: "Closed Won", deals: [], totalValue: 0, count: 0 },
    closed_lost: { stage: "closed_lost", label: "Closed Lost", deals: [], totalValue: 0, count: 0 },
  }

  let totalPipelineValue = 0

  for (const deal of rawDeals) {
    const stage = deal.stage as DealStageType
    if (columns[stage]) {
      columns[stage].deals.push(deal)
      const val = Number(deal.value) || 0
      columns[stage].totalValue += val
      columns[stage].count += 1
      if (stage !== "closed_lost") {
        totalPipelineValue += val
      }
    }
  }

  return {
    columns,
    totalCount: rawDeals.length,
    totalPipelineValue,
  }
}

/**
 * Fetch a single deal by ID with customer, assignee, and activities.
 */
export async function getDealById(
  id: string,
  organizationId: string
): Promise<DealWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    title: data.title || data.name,
    expected_close: data.expected_close || data.expected_close_date,
  } as DealWithDetails
}

/**
 * Fetch active deals linked to a specific customer.
 */
export async function getDealsByCustomerId(
  customerId: string,
  organizationId: string
): Promise<DealWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deals")
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq("customer_id", customerId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching deals for customer:", error)
    return []
  }

  return (data || []).map((row) => ({
    ...row,
    title: row.title || row.name,
    expected_close: row.expected_close || row.expected_close_date,
  })) as DealWithDetails[]
}

/**
 * Creates a new deal.
 */
export async function createDeal(
  organizationId: string,
  userId: string,
  input: CreateDealOutput
): Promise<DealWithDetails> {
  // 1. Verify customer exists in current org
  const customerValid = await validateCustomerBelongsToOrg(input.customer_id, organizationId)
  if (!customerValid) {
    throw new Error("Selected customer not found or does not belong to your organization")
  }

  // 2. Verify assignee belongs to org if specified
  if (input.assigned_to) {
    const isValidMember = await validateAssigneeMembership(input.assigned_to, organizationId)
    if (!isValidMember) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const insertPayload = {
    organization_id: organizationId,
    customer_id: input.customer_id,
    title: input.title,
    name: input.title, // mirror for backwards compatibility
    stage: input.stage,
    value: input.value,
    currency: input.currency,
    expected_close: input.expected_close,
    expected_close_date: input.expected_close,
    assigned_to: input.assigned_to,
    notes: input.notes,
  }

  const { data, error } = await supabase
    .from("deals")
    .insert(insertPayload)
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error inserting deal:", error)
    throw new Error(error?.message || "Failed to create deal")
  }

  // Log activity
  await logActivity({
    organizationId,
    userId,
    action: "deal_created",
    entityType: "deal",
    entityId: data.id,
    details: {
      title: data.title || data.name,
      value: data.value,
      currency: data.currency,
      stage: data.stage,
      customer_id: data.customer_id,
    },
  })

  return {
    ...data,
    title: data.title || data.name,
    expected_close: data.expected_close || data.expected_close_date,
  } as DealWithDetails
}

/**
 * Updates an existing deal.
 */
export async function updateDeal(
  id: string,
  organizationId: string,
  userId: string,
  input: UpdateDealOutput
): Promise<DealWithDetails> {
  const existing = await getDealById(id, organizationId)
  if (!existing) {
    throw new Error("Deal not found or does not belong to your organization")
  }

  if (input.customer_id && input.customer_id !== existing.customer_id) {
    const customerValid = await validateCustomerBelongsToOrg(input.customer_id, organizationId)
    if (!customerValid) {
      throw new Error("Selected customer not found or does not belong to your organization")
    }
  }

  if (input.assigned_to) {
    const isValidMember = await validateAssigneeMembership(input.assigned_to, organizationId)
    if (!isValidMember) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const updatePayload: Database["public"]["Tables"]["deals"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) {
    updatePayload.title = input.title
    updatePayload.name = input.title
  }
  if (input.customer_id !== undefined) updatePayload.customer_id = input.customer_id
  if (input.stage !== undefined) updatePayload.stage = input.stage
  if (input.value !== undefined) updatePayload.value = input.value
  if (input.currency !== undefined) updatePayload.currency = input.currency
  if (input.expected_close !== undefined) {
    updatePayload.expected_close = input.expected_close
    updatePayload.expected_close_date = input.expected_close
  }
  if (input.assigned_to !== undefined) updatePayload.assigned_to = input.assigned_to
  if (input.notes !== undefined) updatePayload.notes = input.notes

  const { data, error } = await supabase
    .from("deals")
    .update(updatePayload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error updating deal:", error)
    throw new Error(error?.message || "Failed to update deal")
  }

  await logActivity({
    organizationId,
    userId,
    action: "deal_updated",
    entityType: "deal",
    entityId: id,
    details: {
      title: data.title || data.name,
      value: data.value,
      stage: data.stage,
    },
  })

  return {
    ...data,
    title: data.title || data.name,
    expected_close: data.expected_close || data.expected_close_date,
  } as DealWithDetails
}

/**
 * Changes a deal's stage and records an activity log with before/after state.
 */
export async function changeDealStage(
  id: string,
  organizationId: string,
  userId: string,
  newStage: DealStageType
): Promise<DealWithDetails> {
  const existing = await getDealById(id, organizationId)
  if (!existing) {
    throw new Error("Deal not found or does not belong to your organization")
  }

  if (existing.stage === newStage) {
    return existing
  }

  const previousStage = existing.stage

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deals")
    .update({
      stage: newStage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error changing deal stage:", error)
    throw new Error(error?.message || "Failed to change deal stage")
  }

  await logActivity({
    organizationId,
    userId,
    action: "deal_stage_changed",
    entityType: "deal",
    entityId: id,
    details: {
      title: data.title || data.name,
      previous_stage: previousStage,
      new_stage: newStage,
      value: data.value,
    },
  })

  return {
    ...data,
    title: data.title || data.name,
    expected_close: data.expected_close || data.expected_close_date,
  } as DealWithDetails
}

/**
 * Assigns a deal to an organization member.
 */
export async function assignDeal(
  id: string,
  organizationId: string,
  userId: string,
  assignedTo: string | null
): Promise<DealWithDetails> {
  const existing = await getDealById(id, organizationId)
  if (!existing) {
    throw new Error("Deal not found or does not belong to your organization")
  }

  if (assignedTo) {
    const isValid = await validateAssigneeMembership(assignedTo, organizationId)
    if (!isValid) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deals")
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      customer:customers!deals_customer_id_fkey(
        id,
        name,
        primary_contact_name,
        primary_contact_email
      ),
      assigned_user:profiles!deals_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error assigning deal:", error)
    throw new Error(error?.message || "Failed to assign deal")
  }

  await logActivity({
    organizationId,
    userId,
    action: "deal_assigned",
    entityType: "deal",
    entityId: id,
    details: {
      title: data.title || data.name,
      assigned_to: assignedTo,
    },
  })

  return {
    ...data,
    title: data.title || data.name,
    expected_close: data.expected_close || data.expected_close_date,
  } as DealWithDetails
}

/**
 * Soft deletes a deal.
 */
export async function softDeleteDeal(
  id: string,
  organizationId: string,
  userId: string
): Promise<void> {
  const existing = await getDealById(id, organizationId)
  if (!existing) {
    throw new Error("Deal not found or does not belong to your organization")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("deals")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)

  if (error) {
    console.error("Error soft deleting deal:", error)
    throw new Error(error.message || "Failed to delete deal")
  }

  await logActivity({
    organizationId,
    userId,
    action: "deal_deleted",
    entityType: "deal",
    entityId: id,
    details: {
      title: existing.title,
    },
  })
}

/**
 * Restores a soft-deleted deal.
 */
export async function restoreDeal(
  id: string,
  organizationId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient()

  const { data: existing, error: fetchError } = await supabase
    .from("deals")
    .select("id, title, name")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .not("deleted_at", "is", null)
    .maybeSingle()

  if (fetchError || !existing) {
    throw new Error("Archived deal not found or already active")
  }

  const { error } = await supabase
    .from("deals")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)

  if (error) {
    console.error("Error restoring deal:", error)
    throw new Error(error.message || "Failed to restore deal")
  }

  await logActivity({
    organizationId,
    userId,
    action: "deal_restored",
    entityType: "deal",
    entityId: id,
    details: {
      title: existing.title || existing.name,
    },
  })
}

/**
 * Returns active customers for dropdown selectors in create/edit deal forms.
 */
export async function getCustomerOptions(
  organizationId: string
): Promise<Array<{ id: string; name: string; contact: string | null }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, primary_contact_name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching customer options:", error)
    return []
  }

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    contact: c.primary_contact_name,
  }))
}
