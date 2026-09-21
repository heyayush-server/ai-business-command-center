import { createClient } from "@/lib/supabase/server"
import type { LeadStatus, DealStage, TaskStatus } from "@/lib/types/database.types"
import { getActivities, type ActivityWithDetails } from "@/lib/services/activities.service"

export interface DashboardKPIs {
  totalLeads: number
  recentLeadsCount: number
  totalCustomers: number
  recentCustomersCount: number
  openDealsCount: number
  openDealsValue: number
  wonDealsCount: number
  wonDealsValue: number
  recentWonDealsCount: number
  totalPipelineValue: number
  openTasksCount: number
  tasksDueSoonCount: number
}

export interface PipelineStageSummary {
  stage: DealStage
  label: string
  count: number
  totalValue: number
  percentage: number
  color: string
}

export interface LeadCustomerSummary {
  totalLeads: number
  leadsByStatus: Record<LeadStatus, number>
  totalCustomers: number
  recentCustomers: Array<{
    id: string
    name: string
    industry: string | null
    created_at: string
    converted_from_lead_id: string | null
  }>
  convertedLeadsCount: number
  conversionRate: number
}

export interface TaskOverviewSummary {
  overdueCount: number
  dueTodayCount: number
  dueThisWeekCount: number
  tasksByStatus: Record<TaskStatus, number>
  highUrgentOpenCount: number
  openTasks: number
  completedTasks: number
}

export interface PriorityItem {
  id: string
  type: "overdue_task" | "urgent_task" | "deal_closing_soon" | "deal_needs_attention"
  title: string
  subtitle: string
  badgeText: string
  badgeVariant: "destructive" | "secondary" | "default" | "outline"
  dateLabel?: string | null
  href: string
}

export interface DashboardData {
  kpis: DashboardKPIs
  pipeline: {
    stages: PipelineStageSummary[]
    totalValue: number
    totalDeals: number
  }
  leadCustomer: LeadCustomerSummary
  taskOverview: TaskOverviewSummary
  priorityWork: PriorityItem[]
  recentActivities: ActivityWithDetails[]
}

const STAGE_CONFIG: Record<DealStage, { label: string; color: string }> = {
  discovery: { label: "Discovery", color: "bg-blue-500" },
  proposal: { label: "Proposal", color: "bg-amber-500" },
  negotiation: { label: "Negotiation", color: "bg-purple-500" },
  closed_won: { label: "Closed Won", color: "bg-emerald-500" },
  closed_lost: { label: "Closed Lost", color: "bg-slate-400" },
}

/**
 * Server-side aggregator for all organization-scoped dashboard metrics.
 * Runs queries in parallel, prevents N+1 lookups, and respects RLS.
 */
export async function getDashboardData(
  organizationId: string
): Promise<DashboardData> {
  if (!organizationId) {
    throw new Error("Organization ID is required")
  }

  const supabase = await createClient()

  // Parallel fetch of raw table records for the active organization
  const [leadsRes, customersRes, dealsRes, tasksRes, activitiesRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, status, created_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null),
    supabase
      .from("customers")
      .select("id, name, industry, created_at, converted_from_lead_id")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("deals")
      .select("id, title, stage, value, currency, expected_close, expected_close_date, created_at, updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, created_at, assigned_to")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("due_date", { ascending: true, nullsFirst: false }),
    getActivities({ page: 1, pageSize: 6 }, organizationId).catch((err) => {
      console.error("[dashboard.service] Error fetching activities:", err)
      return { activities: [], total: 0, page: 1, pageSize: 6, totalPages: 0 }
    }),
  ])

  if (leadsRes.error) {
    console.error("[dashboard.service] Error fetching leads:", leadsRes.error)
  }
  if (customersRes.error) {
    console.error("[dashboard.service] Error fetching customers:", customersRes.error)
  }
  if (dealsRes.error) {
    console.error("[dashboard.service] Error fetching deals:", dealsRes.error)
  }
  if (tasksRes.error) {
    console.error("[dashboard.service] Error fetching tasks:", tasksRes.error)
  }

  const leads = leadsRes.data || []
  const customers = customersRes.data || []
  const deals = dealsRes.data || []
  const tasks = tasksRes.data || []
  const activities = activitiesRes.activities || []

  // Date boundaries
  const now = new Date()
  const thirtyDaysAgoIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const todayDateStr = now.toISOString().slice(0, 10)
  const sevenDaysDateStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const fourteenDaysDateStr = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // 1. Leads calculations
  const totalLeads = leads.length
  const recentLeadsCount = leads.filter((l) => l.created_at >= thirtyDaysAgoIso).length
  const leadsByStatus: Record<LeadStatus, number> = {
    new: 0,
    contacted: 0,
    qualifying: 0,
    qualified: 0,
    lost: 0,
  }
  for (const lead of leads) {
    if (lead.status && lead.status in leadsByStatus) {
      leadsByStatus[lead.status]++
    }
  }

  // 2. Customers calculations
  const totalCustomers = customers.length
  const recentCustomersCount = customers.filter((c) => c.created_at >= thirtyDaysAgoIso).length
  const convertedCustomers = customers.filter((c) => c.converted_from_lead_id !== null)
  const convertedLeadsCount = convertedCustomers.length
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeadsCount / totalLeads) * 1000) / 10 : 0

  // 3. Deals calculations
  const OPEN_STAGES: DealStage[] = ["discovery", "proposal", "negotiation"]
  const openDeals = deals.filter((d) => OPEN_STAGES.includes(d.stage))
  const wonDeals = deals.filter((d) => d.stage === "closed_won")
  
  const openDealsCount = openDeals.length
  const openDealsValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  const wonDealsCount = wonDeals.length
  const wonDealsValue = wonDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
  const recentWonDealsCount = wonDeals.filter(
    (d) => (d.updated_at || d.created_at) >= thirtyDaysAgoIso
  ).length
  const totalPipelineValue = openDealsValue

  // Pipeline stage breakdown
  const ALL_STAGES: DealStage[] = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]
  const stageStats: Record<DealStage, { count: number; totalValue: number }> = {
    discovery: { count: 0, totalValue: 0 },
    proposal: { count: 0, totalValue: 0 },
    negotiation: { count: 0, totalValue: 0 },
    closed_won: { count: 0, totalValue: 0 },
    closed_lost: { count: 0, totalValue: 0 },
  }

  let allDealsTotalValue = 0
  for (const deal of deals) {
    const val = Number(deal.value) || 0
    allDealsTotalValue += val
    if (deal.stage && deal.stage in stageStats) {
      stageStats[deal.stage].count++
      stageStats[deal.stage].totalValue += val
    }
  }

  const pipelineStages: PipelineStageSummary[] = ALL_STAGES.map((stage) => {
    const stat = stageStats[stage]
    const cfg = STAGE_CONFIG[stage]
    const pct = allDealsTotalValue > 0 ? Math.round((stat.totalValue / allDealsTotalValue) * 100) : 0
    return {
      stage,
      label: cfg.label,
      count: stat.count,
      totalValue: stat.totalValue,
      percentage: pct,
      color: cfg.color,
    }
  })

  // 4. Tasks calculations
  const tasksByStatus: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    done: 0,
    cancelled: 0,
  }

  let overdueCount = 0
  let dueTodayCount = 0
  let dueThisWeekCount = 0
  let highUrgentOpenCount = 0
  let openTasksCount = 0
  let tasksDueSoonCount = 0

  for (const task of tasks) {
    if (task.status && task.status in tasksByStatus) {
      tasksByStatus[task.status]++
    }

    const isOpen = task.status === "todo" || task.status === "in_progress"
    if (isOpen) {
      openTasksCount++

      if (task.priority === "high" || task.priority === "urgent") {
        highUrgentOpenCount++
      }

      if (task.due_date) {
        const dueDateClean = task.due_date.slice(0, 10)
        if (dueDateClean < todayDateStr) {
          overdueCount++
          tasksDueSoonCount++
        } else if (dueDateClean === todayDateStr) {
          dueTodayCount++
          tasksDueSoonCount++
        } else if (dueDateClean <= sevenDaysDateStr) {
          dueThisWeekCount++
          tasksDueSoonCount++
        }
      }
    }
  }

  // 5. Priority Work items (deterministic, non-speculative)
  const priorityItems: PriorityItem[] = []

  // A. Overdue open tasks
  const overdueTasks = tasks
    .filter((t) => (t.status === "todo" || t.status === "in_progress") && t.due_date && t.due_date.slice(0, 10) < todayDateStr)
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))

  for (const t of overdueTasks.slice(0, 3)) {
    priorityItems.push({
      id: `task-${t.id}`,
      type: "overdue_task",
      title: t.title,
      subtitle: `Overdue task • Assigned to team member`,
      badgeText: "Overdue",
      badgeVariant: "destructive",
      dateLabel: t.due_date ? `Due ${t.due_date.slice(0, 10)}` : undefined,
      href: "/tasks?due_date_filter=overdue",
    })
  }

  // B. Urgent tasks not yet overdue
  const urgentTasks = tasks
    .filter(
      (t) =>
        (t.status === "todo" || t.status === "in_progress") &&
        (t.priority === "urgent" || t.priority === "high") &&
        (!t.due_date || t.due_date.slice(0, 10) >= todayDateStr)
    )
    .sort((a, b) => (a.due_date || "9999").localeCompare(b.due_date || "9999"))

  for (const t of urgentTasks.slice(0, 2)) {
    if (priorityItems.length >= 5) break
    priorityItems.push({
      id: `task-urgent-${t.id}`,
      type: "urgent_task",
      title: t.title,
      subtitle: `${t.priority.toUpperCase()} priority • Needs resolution`,
      badgeText: t.priority === "urgent" ? "Urgent" : "High Priority",
      badgeVariant: "secondary",
      dateLabel: t.due_date ? `Due ${t.due_date.slice(0, 10)}` : "No due date",
      href: `/tasks?priority=${t.priority}`,
    })
  }

  // C. Deals needing attention (expected close date within 14 days or past, still open)
  const attentionDeals = openDeals
    .filter((d) => {
      const closeDate = d.expected_close || d.expected_close_date
      return closeDate && closeDate.slice(0, 10) <= fourteenDaysDateStr
    })
    .sort((a, b) => {
      const dateA = a.expected_close || a.expected_close_date || ""
      const dateB = b.expected_close || b.expected_close_date || ""
      return dateA.localeCompare(dateB)
    })

  for (const d of attentionDeals.slice(0, 2)) {
    if (priorityItems.length >= 6) break
    const closeDate = d.expected_close || d.expected_close_date || ""
    const isPast = closeDate.slice(0, 10) < todayDateStr
    priorityItems.push({
      id: `deal-${d.id}`,
      type: "deal_closing_soon",
      title: d.title,
      subtitle: `$${Number(d.value || 0).toLocaleString()} • ${STAGE_CONFIG[d.stage]?.label || d.stage}`,
      badgeText: isPast ? "Closing Overdue" : "Target Close Soon",
      badgeVariant: isPast ? "destructive" : "default",
      dateLabel: `Target ${closeDate.slice(0, 10)}`,
      href: "/deals",
    })
  }

  return {
    kpis: {
      totalLeads,
      recentLeadsCount,
      totalCustomers,
      recentCustomersCount,
      openDealsCount,
      openDealsValue,
      wonDealsCount,
      wonDealsValue,
      recentWonDealsCount,
      totalPipelineValue,
      openTasksCount,
      tasksDueSoonCount,
    },
    pipeline: {
      stages: pipelineStages,
      totalValue: openDealsValue,
      totalDeals: deals.length,
    },
    leadCustomer: {
      totalLeads,
      leadsByStatus,
      totalCustomers,
      recentCustomers: customers.slice(0, 5).map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry,
        created_at: c.created_at,
        converted_from_lead_id: c.converted_from_lead_id,
      })),
      convertedLeadsCount,
      conversionRate,
    },
    taskOverview: {
      overdueCount,
      dueTodayCount,
      dueThisWeekCount,
      tasksByStatus,
      highUrgentOpenCount,
      openTasks: openTasksCount,
      completedTasks: tasksByStatus.done,
    },
    priorityWork: priorityItems,
    recentActivities: activities,
  }
}
