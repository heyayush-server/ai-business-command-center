import { createClient } from "@/lib/supabase/server"
import { logActivity } from "@/lib/services/activities.service"
import { validateAssigneeMembership } from "@/lib/services/leads.service"
import type { Database, CustomerStatus } from "@/lib/types/database.types"
import type {
  CreateCustomerInput,
  CreateCustomerOutput,
  UpdateCustomerInput,
  UpdateCustomerOutput,
  CustomerFilterParams,
} from "@/lib/validations/customer.schema"

export type CustomerRow = Database["public"]["Tables"]["customers"]["Row"]

export type CustomerWithDetails = CustomerRow & {
  assigned_user?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  converted_from_lead?: {
    id: string
    first_name: string
    last_name: string
    company: string | null
    email: string | null
  } | null
  deals?: Array<{
    id: string
    name: string
    value: number
    stage: string
    probability: number
    expected_close_date: string | null
  }>
}

export interface GetCustomersResult {
  customers: CustomerWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Server-side paginated, filtered, and sorted query for customers.
 * RLS enforces organization boundary automatically.
 */
export async function getCustomers(
  params: Partial<CustomerFilterParams>,
  organizationId: string
): Promise<GetCustomersResult> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    const { MOCK_DEV_CUSTOMERS } = await import("@/lib/mock/crm-entities")
    return {
      customers: MOCK_DEV_CUSTOMERS,
      total: MOCK_DEV_CUSTOMERS.length,
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
    .from("customers")
    .select(
      `
      *,
      assigned_user:profiles!customers_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      converted_from_lead:leads!customers_converted_from_lead_id_fkey(
        id,
        first_name,
        last_name,
        company,
        email
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
    query = query.eq("status", params.status as CustomerStatus)
  }

  // Filter by assignee
  if (params.assigned_to && params.assigned_to !== "all") {
    if (params.assigned_to === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", params.assigned_to)
    }
  }

  // Search filter across name, primary contact name, email
  if (params.search && params.search.trim().length > 0) {
    const cleanSearch = params.search.trim().replace(/[,()]/g, "")
    query = query.or(
      `name.ilike.%${cleanSearch}%,primary_contact_name.ilike.%${cleanSearch}%,primary_contact_email.ilike.%${cleanSearch}%`
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
    console.error("[customers.service] Error fetching customers:", error)
    throw new Error(error.message || "Failed to fetch customers")
  }

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    customers: (data as unknown as CustomerWithDetails[]) || [],
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Fetches a single customer by ID, including assignee, source lead, and linked deals.
 */
export async function getCustomerById(
  id: string,
  organizationId: string
): Promise<CustomerWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      assigned_user:profiles!customers_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      converted_from_lead:leads!customers_converted_from_lead_id_fkey(
        id,
        first_name,
        last_name,
        company,
        email
      ),
      deals:deals(
        id,
        name,
        value,
        stage,
        probability,
        expected_close_date
      )
    `)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error) {
    console.error("[customers.service] Error fetching customer by ID:", error)
    return null
  }

  return (data as unknown as CustomerWithDetails) || null
}

/**
 * Creates a new customer account.
 */
export async function createCustomer(
  input: CreateCustomerInput | CreateCustomerOutput,
  organizationId: string,
  actorUserId: string
): Promise<CustomerRow> {
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

  const status = (input.status || "active") as CustomerStatus

  const { data, error } = await supabase
    .from("customers")
    .insert({
      organization_id: organizationId,
      name: input.name,
      industry: input.industry || null,
      status,
      primary_contact_name: input.primary_contact_name || null,
      primary_contact_email: input.primary_contact_email || null,
      primary_contact_phone: input.primary_contact_phone || null,
      website: input.website || null,
      assigned_to: input.assigned_to || null,
      converted_from_lead_id: input.converted_from_lead_id || null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error("[customers.service] Error creating customer:", error)
    throw new Error(error?.message || "Failed to create customer")
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "customer",
    entityId: data.id,
    action: "customer.created",
    details: {
      name: data.name,
      status: data.status,
      primary_contact_email: data.primary_contact_email,
      assigned_to: data.assigned_to,
    },
  })

  return data
}

/**
 * Updates an existing customer and logs activity.
 */
export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput | UpdateCustomerOutput,
  organizationId: string,
  actorUserId: string
): Promise<CustomerRow> {
  const supabase = await createClient()

  const existing = await getCustomerById(id, organizationId)
  if (!existing) {
    throw new Error("Customer not found or access denied")
  }

  if (input.assigned_to && input.assigned_to !== existing.assigned_to) {
    const isValidMember = await validateAssigneeMembership(
      input.assigned_to,
      organizationId
    )
    if (!isValidMember) {
      throw new Error("Assigned user is not a member of this organization")
    }
  }

  const updatePayload: Database["public"]["Tables"]["customers"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updatePayload.name = input.name
  if (input.industry !== undefined) updatePayload.industry = input.industry
  if (input.status !== undefined) updatePayload.status = input.status
  if (input.primary_contact_name !== undefined)
    updatePayload.primary_contact_name = input.primary_contact_name
  if (input.primary_contact_email !== undefined)
    updatePayload.primary_contact_email = input.primary_contact_email
  if (input.primary_contact_phone !== undefined)
    updatePayload.primary_contact_phone = input.primary_contact_phone
  if (input.website !== undefined) updatePayload.website = input.website
  if (input.assigned_to !== undefined)
    updatePayload.assigned_to = input.assigned_to

  const { data, error } = await supabase
    .from("customers")
    .update(updatePayload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[customers.service] Error updating customer:", error)
    throw new Error(error?.message || "Failed to update customer")
  }

  if (input.status && input.status !== existing.status) {
    await logActivity({
      organizationId,
      actorType: "user",
      userId: actorUserId,
      entityType: "customer",
      entityId: id,
      action: "customer.status_changed",
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
      entityType: "customer",
      entityId: id,
      action: "customer.assigned",
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
    entityType: "customer",
    entityId: id,
    action: "customer.updated",
    details: {
      name: data.name,
      status: data.status,
    },
  })

  return data
}

/**
 * Soft deletes a customer.
 */
export async function softDeleteCustomer(
  id: string,
  organizationId: string,
  actorUserId: string
): Promise<CustomerRow> {
  const supabase = await createClient()

  const existing = await getCustomerById(id, organizationId)
  if (!existing) {
    throw new Error("Customer not found or access denied")
  }

  const { data, error } = await supabase
    .from("customers")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[customers.service] Error deleting customer:", error)
    throw new Error(error?.message || "Failed to delete customer")
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "customer",
    entityId: id,
    action: "customer.deleted",
    details: { name: existing.name },
  })

  return data
}

/**
 * Restores a soft-deleted customer.
 */
export async function restoreCustomer(
  id: string,
  organizationId: string,
  actorUserId: string
): Promise<CustomerRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single()

  if (error || !data) {
    console.error("[customers.service] Error restoring customer:", error)
    throw new Error(error?.message || "Failed to restore customer")
  }

  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "customer",
    entityId: id,
    action: "customer.restored",
    details: { name: data.name },
  })

  return data
}

/**
 * Converts a qualified lead into a customer account.
 * Guards against duplicate conversions and ensures organization isolation.
 */
export async function convertLeadToCustomer(
  leadId: string,
  organizationId: string,
  actorUserId: string,
  customData?: {
    name?: string
    industry?: string | null
    assigned_to?: string | null
  }
): Promise<CustomerRow> {
  const supabase = await createClient()

  // 1. Check if the lead has ALREADY been converted (duplicate prevention)
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id, name")
    .eq("organization_id", organizationId)
    .eq("converted_from_lead_id", leadId)
    .maybeSingle()

  if (existingCustomer) {
    throw new Error(
      `This lead has already been converted into customer account "${existingCustomer.name}".`
    )
  }

  // 2. Fetch the lead record
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (leadError || !lead) {
    throw new Error("Lead not found or access denied")
  }

  // 3. Resolve assignee
  const assigneeId =
    customData?.assigned_to !== undefined
      ? customData.assigned_to
      : lead.assigned_to

  if (assigneeId) {
    const isValidMember = await validateAssigneeMembership(
      assigneeId,
      organizationId
    )
    if (!isValidMember) {
      throw new Error("Assigned user is not a member of this organization")
    }
  }

  // 4. Derive customer company name
  const leadFullName = `${lead.first_name || ""} ${lead.last_name || ""}`.trim()
  const customerName =
    customData?.name?.trim() ||
    lead.company?.trim() ||
    leadFullName ||
    "New Account"

  // 5. Insert new customer
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      organization_id: organizationId,
      name: customerName,
      industry: customData?.industry || null,
      status: "active",
      primary_contact_name: leadFullName || null,
      primary_contact_email: lead.email || null,
      primary_contact_phone: lead.phone || null,
      assigned_to: assigneeId,
      converted_from_lead_id: lead.id,
      metadata: {
        converted_at: new Date().toISOString(),
        original_lead_source: lead.source,
      },
    })
    .select()
    .single()

  if (customerError || !customer) {
    console.error("[customers.service] Error creating customer from lead:", customerError)
    throw new Error(customerError?.message || "Failed to convert lead to customer")
  }

  // 6. Update lead status to 'qualified' and note conversion in lead metadata
  const existingMetadata =
    lead.metadata && typeof lead.metadata === "object"
      ? (lead.metadata as Record<string, unknown>)
      : {}

  await supabase
    .from("leads")
    .update({
      status: "qualified",
      metadata: {
        ...existingMetadata,
        converted_to_customer_id: customer.id,
        converted_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", lead.id)
    .eq("organization_id", organizationId)

  // 7. Audit log on the lead
  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "lead",
    entityId: lead.id,
    action: "lead.converted_to_customer",
    details: {
      customer_id: customer.id,
      customer_name: customer.name,
    },
  })

  // 8. Audit log on the newly created customer
  await logActivity({
    organizationId,
    actorType: "user",
    userId: actorUserId,
    entityType: "customer",
    entityId: customer.id,
    action: "customer.created_from_lead",
    details: {
      lead_id: lead.id,
      lead_name: leadFullName,
      lead_company: lead.company,
    },
  })

  return customer
}
