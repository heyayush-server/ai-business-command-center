import { createClient } from "@/lib/supabase/server"
import { logActivity } from "@/lib/services/activities.service"
import type { Database, LeadStatus } from "@/lib/types/database.types"
import type {
  CreateLeadInput,
  CreateLeadOutput,
  UpdateLeadInput,
  UpdateLeadOutput,
  LeadFilterParams,
} from "@/lib/validations/lead.schema"

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"]

export type LeadWithAssignee = LeadRow & {
  assigned_user?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
}

export interface GetLeadsResult {
  leads: LeadWithAssignee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OrganizationMemberOption {
  userId: string
  role: string
  fullName: string | null
  email: string | null
  avatarUrl: string | null
}

/**
 * Validates that an assigned user is an active member of the given organization.
 */
export async function validateAssigneeMembership(
  assignedToUserId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", assignedToUserId)
    .maybeSingle()

  if (error || !data) {
    return false
  }
  return true
}

/**
 * Retrieves members of an organization with profile info for assignee selection.
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMemberOption[]> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    return [
      {
        userId: "00000000-0000-0000-0000-000000000001",
        role: "owner",
        fullName: "Ishan Sharma",
        email: "dev@commandcenter.io",
        avatarUrl: null,
      },
    ]
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      user_id,
      role,
      profile:profiles!organization_members_user_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true })

  if (error || !data) {
    console.error("[leads.service] Failed to fetch organization members:", error)
    return []
  }

  return data.map((item) => {
    const profile = item.profile as unknown as {
      id: string
      full_name: string | null
      email: string | null
      avatar_url: string | null
    } | null

    return {
      userId: item.user_id,
      role: item.role,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    }
  })
}

/**
 * Server-side paginated, filtered, and sorted query for leads.
 * RLS enforces organization isolation automatically.
 */
export async function getLeads(
  params: Partial<LeadFilterParams>,
  organizationId: string
): Promise<GetLeadsResult> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    const { MOCK_DEV_LEADS } = await import("@/lib/mock/crm-entities")
    return {
      leads: MOCK_DEV_LEADS,
      total: MOCK_DEV_LEADS.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }
  }

  const supabase = await createClient()

  const page = Math.max(1, params.page || 1)
  const pageSize = Math.max(1, Math.min(100, params.pageSize || 10))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("leads")
    .select(
      `
      *,
      assigned_user:profiles!leads_assigned_to_fkey(
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

  // Filter by status
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status as LeadStatus)
  }

  // Filter by source
  if (params.source && params.source !== "all") {
    query = query.eq("source", params.source)
  }

  // Filter by assignee
  if (params.assigned_to && params.assigned_to !== "all") {
    if (params.assigned_to === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", params.assigned_to)
    }
  }

  // Search filter across name, company, email
  if (params.search && params.search.trim().length > 0) {
    const cleanSearch = params.search.trim().replace(/[,()]/g, "")
    query = query.or(
      `first_name.ilike.%${cleanSearch}%,last_name.ilike.%${cleanSearch}%,company.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`
    )
  }

  // Sorting
  const sortBy = params.sortBy || "created_at"
  const ascending = params.sortOrder === "asc"
  query = query.order(sortBy, { ascending })

  // Pagination
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error("[leads.service] Error fetching leads:", error)
    throw new Error(error.message || "Failed to fetch leads")
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    leads: (data as unknown as LeadWithAssignee[]) || [],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Fetches a single lead by ID, verifying organization isolation.
 */
export async function getLeadById(
  id: string,
  organizationId: string
): Promise<LeadWithAssignee | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      assigned_user:profiles!leads_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error) {
    console.error("[leads.service] Error fetching lead by ID:", error)
    return null
  }

  return (data as unknown as LeadWithAssignee) || null
}

/**
 * Creates a new lead in the database and logs an audit activity record.
 */
export async function createLead(
  input: CreateLeadInput | CreateLeadOutput,
  organizationId: string,
  actorUserId: string
): Promise<LeadRow> {
  const supabase = await createClient()

  // Validate assignee if supplied
  if (input.assigned_to) {
    const isValidMember = await validateAssigneeMembership(
      input.assigned_to,
      organizationId
    )
    if (!isValidMember) {
      throw new Error("Assigned user is not a member of this organization")
    }
  }

  const status = (input.status || "new") as LeadStatus

  const { data, error } = await supabase
    .from("leads")
    .insert({
      organization_id: organizationId,
      first_name: input.first_name,
      last_name: input.last_name || "",
      email: input.email || null,
      phone: input.phone || null,
      company: input.company || null,
      status,
      source: input.source || null,
      assigned_to: input.assigned_to || null,
      notes: input.notes || null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error("[leads.service] Error creating lead:", error)
    throw new Error(error?.message || "Failed to create lead")
  }

  // Audit activity
  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "lead",
    entityId: data.id,
    action: "lead.created",
    details: {
      name: `${data.first_name} ${data.last_name}`.trim(),
      company: data.company,
      email: data.email,
      status: data.status,
      source: data.source,
      assigned_to: data.assigned_to,
    },
  })

  return data
}

/**
 * Updates an existing lead and logs specific activity changes (e.g. status transition, assignment).
 */
export async function updateLead(
  id: string,
  input: UpdateLeadInput | UpdateLeadOutput,
  organizationId: string,
  actorUserId: string
): Promise<LeadRow> {
  const supabase = await createClient()

  // 1. Fetch current lead state to compare changes
  const existing = await getLeadById(id, organizationId)
  if (!existing) {
    throw new Error("Lead not found or access denied")
  }

  // 2. Validate assignee membership if changed
  if (input.assigned_to && input.assigned_to !== existing.assigned_to) {
    const isValidMember = await validateAssigneeMembership(
      input.assigned_to,
      organizationId
    )
    if (!isValidMember) {
      throw new Error("Assigned user is not a member of this organization")
    }
  }

  // 3. Prepare update payload
  const updatePayload: Database["public"]["Tables"]["leads"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.first_name !== undefined) updatePayload.first_name = input.first_name
  if (input.last_name !== undefined) updatePayload.last_name = input.last_name
  if (input.email !== undefined) updatePayload.email = input.email
  if (input.phone !== undefined) updatePayload.phone = input.phone
  if (input.company !== undefined) updatePayload.company = input.company
  if (input.status !== undefined) updatePayload.status = input.status
  if (input.source !== undefined) updatePayload.source = input.source
  if (input.notes !== undefined) updatePayload.notes = input.notes
  if (input.assigned_to !== undefined) updatePayload.assigned_to = input.assigned_to

  const { data, error } = await supabase
    .from("leads")
    .update(updatePayload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[leads.service] Error updating lead:", error)
    throw new Error(error?.message || "Failed to update lead")
  }

  // 4. Log specific activities based on what changed
  if (input.status && input.status !== existing.status) {
    await logActivity({
      organizationId,
      actorType: "user",
      userId: actorUserId,
      entityType: "lead",
      entityId: id,
      action: "lead.status_changed",
      details: {
        previous_status: existing.status,
        new_status: input.status,
      },
    })
  }

  if (input.assigned_to !== undefined && input.assigned_to !== existing.assigned_to) {
    await logActivity({
      organizationId,
      actorType: "user",
      userId: actorUserId,
      entityType: "lead",
      entityId: id,
      action: "lead.assigned",
      details: {
        previous_assigned_to: existing.assigned_to,
        new_assigned_to: input.assigned_to,
      },
    })
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "lead",
    entityId: id,
    action: "lead.updated",
    details: {
      name: `${data.first_name} ${data.last_name}`.trim(),
      status: data.status,
      company: data.company,
    },
  })

  return data
}

/**
 * Soft deletes a lead by setting deleted_at timestamp.
 */
export async function softDeleteLead(
  id: string,
  organizationId: string,
  actorUserId: string
): Promise<LeadRow> {
  const supabase = await createClient()

  const existing = await getLeadById(id, organizationId)
  if (!existing) {
    throw new Error("Lead not found or access denied")
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[leads.service] Error soft deleting lead:", error)
    throw new Error(error?.message || "Failed to delete lead")
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "lead",
    entityId: id,
    action: "lead.deleted",
    details: {
      name: `${existing.first_name} ${existing.last_name}`.trim(),
      company: existing.company,
    },
  })

  return data
}

/**
 * Restores a soft-deleted lead by setting deleted_at to null.
 */
export async function restoreLead(
  id: string,
  organizationId: string,
  actorUserId: string
): Promise<LeadRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leads")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[leads.service] Error restoring lead:", error)
    throw new Error(error?.message || "Failed to restore lead")
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "lead",
    entityId: id,
    action: "lead.restored",
    details: {
      name: `${data.first_name} ${data.last_name}`.trim(),
      company: data.company,
    },
  })

  return data
}
