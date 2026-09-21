import { createClient } from "@/lib/supabase/server"
import { logActivity } from "@/lib/services/activities.service"
import { validateAssigneeMembership } from "@/lib/services/leads.service"
import type { Database, TaskStatus, TaskPriority } from "@/lib/types/database.types"
import type {
  CreateTaskOutput,
  UpdateTaskOutput,
  TaskFilterParams,
  TaskStatusType,
} from "@/lib/validations/task.schema"

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"]

export type TaskWithDetails = TaskRow & {
  assigned_user?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  creator?: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | null
  lead?: {
    id: string
    first_name: string
    last_name: string
    company: string | null
  } | null
  customer?: {
    id: string
    name: string
  } | null
  deal?: {
    id: string
    title: string | null
    name?: string | null
  } | null
}

export interface GetTasksResult {
  tasks: TaskWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TaskEntityOptions {
  leads: Array<{ id: string; name: string; company: string | null }>
  customers: Array<{ id: string; name: string }>
  deals: Array<{ id: string; title: string; customer_name?: string | null }>
}

/**
 * Validates that a lead belongs to the active organization and is not deleted.
 */
export async function validateLeadBelongsToOrg(
  leadId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .eq("id", leadId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle()

  if (error || !data) {
    return false
  }
  return true
}

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
 * Validates that a deal belongs to the active organization and is not deleted.
 */
export async function validateDealBelongsToOrg(
  dealId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("deals")
    .select("id")
    .eq("id", dealId)
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .maybeSingle()

  if (error || !data) {
    return false
  }
  return true
}

/**
 * Fetches available active Leads, Customers, and Deals for the task linkage selects.
 */
export async function getTaskEntityOptions(
  organizationId: string
): Promise<TaskEntityOptions> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    return {
      leads: [
        { id: "lead-1", name: "Rahul Patel", company: "TechFlow Solutions" },
        { id: "lead-2", name: "Sarah Jenkins", company: "Apex Logistics" },
      ],
      customers: [
        { id: "cust-1", name: "Apex Logistics Inc" },
        { id: "cust-2", name: "TechFlow Solutions" },
      ],
      deals: [
        { id: "deal-1", title: "CloudScale Systems Expansion", customer_name: "Apex Logistics Inc" },
        { id: "deal-2", title: "TechFlow Enterprise Rollout", customer_name: "TechFlow Solutions" },
      ],
    }
  }

  const supabase = await createClient()

  const [leadsRes, customersRes, dealsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, first_name, last_name, company")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("first_name", { ascending: true })
      .limit(100),
    supabase
      .from("customers")
      .select("id, name")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .limit(100),
    supabase
      .from("deals")
      .select("id, title, name, customer:customers!deals_customer_id_fkey(name)")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100),
  ])

  const leads = (leadsRes.data || []).map((l) => ({
    id: l.id,
    name: `${l.first_name} ${l.last_name}`.trim(),
    company: l.company,
  }))

  const customers = (customersRes.data || []).map((c) => ({
    id: c.id,
    name: c.name,
  }))

  const deals = (dealsRes.data || []).map((d) => {
    const cust = d.customer as { name?: string | null } | null
    return {
      id: d.id,
      title: d.title || d.name || "Untitled Deal",
      customer_name: cust?.name || null,
    }
  })

  return { leads, customers, deals }
}

/**
 * Server-side paginated, filtered, and sorted query for tasks.
 */
export async function getTasks(
  params: Partial<TaskFilterParams>,
  organizationId: string
): Promise<GetTasksResult> {
  if (process.env.NODE_ENV !== "test" && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))) {
    const { MOCK_DEV_TASKS } = await import("@/lib/mock/crm-entities")
    return {
      tasks: MOCK_DEV_TASKS,
      total: MOCK_DEV_TASKS.length,
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
    .from("tasks")
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
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
    query = query.eq("status", params.status as TaskStatus)
  }

  // Filter by priority
  if (params.priority && params.priority !== "all") {
    query = query.eq("priority", params.priority as TaskPriority)
  }

  // Filter by assignee
  if (params.assigned_to && params.assigned_to !== "all") {
    if (params.assigned_to === "unassigned") {
      query = query.is("assigned_to", null)
    } else {
      query = query.eq("assigned_to", params.assigned_to)
    }
  }

  // Filter by due date
  if (params.due_date_filter && params.due_date_filter !== "all") {
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

    if (params.due_date_filter === "today") {
      query = query.gte("due_date", todayStart).lte("due_date", todayEnd)
    } else if (params.due_date_filter === "overdue") {
      query = query
        .lt("due_date", todayStart)
        .neq("status", "done")
        .neq("status", "cancelled")
    } else if (params.due_date_filter === "this_week") {
      const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      query = query.gte("due_date", todayStart).lte("due_date", endOfWeek)
    } else if (params.due_date_filter === "upcoming") {
      query = query.gte("due_date", todayStart)
    }
  }

  // Search filter across title and description
  if (params.search && params.search.trim().length > 0) {
    const term = `%${params.search.trim()}%`
    query = query.or(`title.ilike.${term},description.ilike.${term}`)
  }

  // Sorting
  const sortBy = params.sortBy || "created_at"
  const ascending = params.sortOrder === "asc"
  query = query.order(sortBy, { ascending, nullsFirst: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error("Error fetching tasks:", error)
    throw new Error(error.message || "Failed to fetch tasks")
  }

  const tasks = (data || []).map((task) => ({
    ...task,
    deal: task.deal
      ? {
          ...task.deal,
          title: task.deal.title || task.deal.name || "Untitled Deal",
        }
      : null,
  })) as TaskWithDetails[]

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize) || 1

  return {
    tasks,
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Fetches a single task by ID with linked details.
 */
export async function getTaskById(
  id: string,
  organizationId: string
): Promise<TaskWithDetails | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
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
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}

/**
 * Creates a new task.
 */
export async function createTask(
  organizationId: string,
  userId: string,
  input: CreateTaskOutput
): Promise<TaskWithDetails> {
  // 1. Validate linked Lead if specified
  if (input.lead_id) {
    const leadValid = await validateLeadBelongsToOrg(input.lead_id, organizationId)
    if (!leadValid) {
      throw new Error("Selected lead not found or does not belong to your organization")
    }
  }

  // 2. Validate linked Customer if specified
  if (input.customer_id) {
    const customerValid = await validateCustomerBelongsToOrg(input.customer_id, organizationId)
    if (!customerValid) {
      throw new Error("Selected customer not found or does not belong to your organization")
    }
  }

  // 3. Validate linked Deal if specified
  if (input.deal_id) {
    const dealValid = await validateDealBelongsToOrg(input.deal_id, organizationId)
    if (!dealValid) {
      throw new Error("Selected deal not found or does not belong to your organization")
    }
  }

  // 4. Validate Assignee if specified
  if (input.assigned_to) {
    const isValidMember = await validateAssigneeMembership(input.assigned_to, organizationId)
    if (!isValidMember) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const insertPayload = {
    organization_id: organizationId,
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    due_date: input.due_date,
    assigned_to: input.assigned_to,
    created_by: userId,
    lead_id: input.lead_id,
    customer_id: input.customer_id,
    deal_id: input.deal_id,
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(insertPayload)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error inserting task:", error)
    throw new Error(error?.message || "Failed to create task")
  }

  // Log activity
  await logActivity({
    organizationId,
    userId,
    action: "task_created",
    entityType: "task",
    entityId: data.id,
    details: {
      title: data.title,
      status: data.status,
      priority: data.priority,
      assigned_to: data.assigned_to,
      lead_id: data.lead_id,
      customer_id: data.customer_id,
      deal_id: data.deal_id,
    },
  })

  return {
    ...data,
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}

/**
 * Updates an existing task.
 */
export async function updateTask(
  id: string,
  organizationId: string,
  userId: string,
  input: UpdateTaskOutput
): Promise<TaskWithDetails> {
  const existing = await getTaskById(id, organizationId)
  if (!existing) {
    throw new Error("Task not found or does not belong to your organization")
  }

  if (input.lead_id && input.lead_id !== existing.lead_id) {
    const leadValid = await validateLeadBelongsToOrg(input.lead_id, organizationId)
    if (!leadValid) {
      throw new Error("Selected lead not found or does not belong to your organization")
    }
  }

  if (input.customer_id && input.customer_id !== existing.customer_id) {
    const customerValid = await validateCustomerBelongsToOrg(input.customer_id, organizationId)
    if (!customerValid) {
      throw new Error("Selected customer not found or does not belong to your organization")
    }
  }

  if (input.deal_id && input.deal_id !== existing.deal_id) {
    const dealValid = await validateDealBelongsToOrg(input.deal_id, organizationId)
    if (!dealValid) {
      throw new Error("Selected deal not found or does not belong to your organization")
    }
  }

  if (input.assigned_to && input.assigned_to !== existing.assigned_to) {
    const isValidMember = await validateAssigneeMembership(input.assigned_to, organizationId)
    if (!isValidMember) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const updatePayload: Database["public"]["Tables"]["tasks"]["Update"] = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) updatePayload.title = input.title
  if (input.description !== undefined) updatePayload.description = input.description
  if (input.status !== undefined) updatePayload.status = input.status
  if (input.priority !== undefined) updatePayload.priority = input.priority
  if (input.due_date !== undefined) updatePayload.due_date = input.due_date
  if (input.assigned_to !== undefined) updatePayload.assigned_to = input.assigned_to
  if (input.lead_id !== undefined) updatePayload.lead_id = input.lead_id
  if (input.customer_id !== undefined) updatePayload.customer_id = input.customer_id
  if (input.deal_id !== undefined) updatePayload.deal_id = input.deal_id

  const { data, error } = await supabase
    .from("tasks")
    .update(updatePayload)
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error updating task:", error)
    throw new Error(error?.message || "Failed to update task")
  }

  await logActivity({
    organizationId,
    userId,
    action: "task_updated",
    entityType: "task",
    entityId: id,
    details: {
      title: data.title,
      status: data.status,
      priority: data.priority,
    },
  })

  return {
    ...data,
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}

/**
 * Updates a task's status (e.g. mark done, todo, etc.) and logs activity.
 */
export async function updateTaskStatus(
  id: string,
  organizationId: string,
  userId: string,
  newStatus: TaskStatusType
): Promise<TaskWithDetails> {
  const existing = await getTaskById(id, organizationId)
  if (!existing) {
    throw new Error("Task not found or does not belong to your organization")
  }

  if (existing.status === newStatus) {
    return existing
  }

  const previousStatus = existing.status

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error updating task status:", error)
    throw new Error(error?.message || "Failed to update task status")
  }

  const action = newStatus === "done" ? "task_completed" : "task_status_changed"

  await logActivity({
    organizationId,
    userId,
    action,
    entityType: "task",
    entityId: id,
    details: {
      title: data.title,
      previous_status: previousStatus,
      new_status: newStatus,
    },
  })

  return {
    ...data,
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}

/**
 * Assigns a task to an organization member.
 */
export async function assignTask(
  id: string,
  organizationId: string,
  userId: string,
  assignedTo: string | null
): Promise<TaskWithDetails> {
  const existing = await getTaskById(id, organizationId)
  if (!existing) {
    throw new Error("Task not found or does not belong to your organization")
  }

  if (assignedTo) {
    const isValid = await validateAssigneeMembership(assignedTo, organizationId)
    if (!isValid) {
      throw new Error("Assigned user is not an active member of this organization")
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      assigned_to: assignedTo,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error assigning task:", error)
    throw new Error(error?.message || "Failed to assign task")
  }

  await logActivity({
    organizationId,
    userId,
    action: "task_assigned",
    entityType: "task",
    entityId: id,
    details: {
      title: data.title,
      assigned_to: assignedTo,
    },
  })

  return {
    ...data,
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}

/**
 * Soft deletes a task.
 */
export async function softDeleteTask(
  id: string,
  organizationId: string,
  userId: string
): Promise<void> {
  const existing = await getTaskById(id, organizationId)
  if (!existing) {
    throw new Error("Task not found or does not belong to your organization")
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("tasks")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)

  if (error) {
    console.error("Error soft deleting task:", error)
    throw new Error(error.message || "Failed to delete task")
  }

  await logActivity({
    organizationId,
    userId,
    action: "task_deleted",
    entityType: "task",
    entityId: id,
    details: {
      title: existing.title,
    },
  })
}

/**
 * Restores a soft-deleted task.
 */
export async function restoreTask(
  id: string,
  organizationId: string,
  userId: string
): Promise<TaskWithDetails> {
  const supabase = await createClient()

  const { data: existing, error: findError } = await supabase
    .from("tasks")
    .select("id, title, deleted_at")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (findError || !existing) {
    throw new Error("Task not found or does not belong to your organization")
  }

  if (!existing.deleted_at) {
    const task = await getTaskById(id, organizationId)
    return task!
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select(
      `
      *,
      assigned_user:profiles!tasks_assigned_to_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      creator:profiles!tasks_created_by_fkey(
        id,
        full_name,
        email,
        avatar_url
      ),
      lead:leads!tasks_lead_id_fkey(
        id,
        first_name,
        last_name,
        company
      ),
      customer:customers!tasks_customer_id_fkey(
        id,
        name
      ),
      deal:deals!tasks_deal_id_fkey(
        id,
        title,
        name
      )
    `
    )
    .single()

  if (error || !data) {
    console.error("Error restoring task:", error)
    throw new Error(error?.message || "Failed to restore task")
  }

  await logActivity({
    organizationId,
    userId,
    action: "task_restored",
    entityType: "task",
    entityId: id,
    details: {
      title: data.title,
    },
  })

  return {
    ...data,
    deal: data.deal
      ? {
          ...data.deal,
          title: data.deal.title || data.deal.name || "Untitled Deal",
        }
      : null,
  } as TaskWithDetails
}
