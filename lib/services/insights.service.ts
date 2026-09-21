/**
 * lib/services/insights.service.ts
 *
 * Phase 14: AI Business Intelligence & Proactive Insights Service.
 *
 * Server-side deterministic engine that analyzes real organization-scoped CRM data
 * (tasks, leads, deals, customers, activities) and extracts high-value actionable insights.
 *
 * SECURITY & ARCHITECTURAL CONTRACTS:
 * 1. Strictly organization-scoped: every query filters by organization_id.
 * 2. Zero fake metrics: insights are ONLY created when underlying data supports them.
 * 3. Soft-delete aware: deleted_at IS NULL is enforced across all tables.
 * 4. Read-only: no database mutations are performed by this service.
 * 5. High performance: all queries run in parallel to avoid N+1 queries.
 */

import { createClient } from "@/lib/supabase/server"
import {
  INSIGHT_TYPES,
  type BusinessInsight,
  type BusinessBriefing,
  type InsightsResult,
  type InsightSeverity,
} from "@/lib/types/insights"

// ── In-Memory Cache (30s TTL per organization) ────────────────────────────────

interface CacheEntry {
  data: InsightsResult
  timestamp: number
}

const CACHE_TTL_MS = 30_000
const insightsCache = new Map<string, CacheEntry>()

/**
 * Clears the insights cache for a specific organization or all organizations.
 * Used primarily in tests or after bulk data operations.
 */
export function clearInsightsCache(organizationId?: string): void {
  if (organizationId) {
    insightsCache.delete(organizationId)
  } else {
    insightsCache.clear()
  }
}

// ── Primary Insights Aggregator ───────────────────────────────────────────────

export interface GetInsightsOptions {
  severity?: InsightSeverity | "all"
  limit?: number
  skipCache?: boolean
}

/**
 * Generates proactive, organization-scoped business intelligence insights.
 */
export async function getBusinessInsights(
  organizationId: string,
  options: GetInsightsOptions = {}
): Promise<InsightsResult> {
  if (!organizationId) {
    throw new Error("Organization ID is required to generate business insights")
  }

  const { severity = "all", limit = 50, skipCache = false } = options

  // 1. Check in-memory cache if caching is not skipped
  if (!skipCache) {
    const cached = insightsCache.get(organizationId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return filterInsightsResult(cached.data, severity, limit)
    }
  }

  const supabase = await createClient()

  // 2. Efficient parallel fetch of organization records (respecting soft-deletes)
  const [tasksRes, leadsRes, dealsRes, customersRes, activitiesRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, status, priority, due_date, created_at, updated_at, assigned_to")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("leads")
      .select("id, first_name, last_name, company, email, status, created_at, updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("deals")
      .select("id, title, value, currency, stage, probability, expected_close, expected_close_date, created_at, updated_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("customers")
      .select("id, name, industry, status, created_at, updated_at, converted_from_lead_id")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("activities")
      .select("id, action, entity_type, entity_id, title, description, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(60),
  ])

  if (tasksRes.error) console.error("[insights.service] Error fetching tasks:", tasksRes.error)
  if (leadsRes.error) console.error("[insights.service] Error fetching leads:", leadsRes.error)
  if (dealsRes.error) console.error("[insights.service] Error fetching deals:", dealsRes.error)
  if (customersRes.error) console.error("[insights.service] Error fetching customers:", customersRes.error)
  if (activitiesRes.error) console.error("[insights.service] Error fetching activities:", activitiesRes.error)

  const tasks = tasksRes.data || []
  const leads = leadsRes.data || []
  const deals = dealsRes.data || []
  const customers = customersRes.data || []
  const activities = activitiesRes.data || []

  // 3. Compute deterministic timestamps
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const threeDaysAgoIso = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const sevenDaysAgoIso = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const fourteenDaysAgoIso = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const twentyOneDaysAgoIso = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyDaysAgoIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAheadStr = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const sevenDaysAheadStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // Fast lookup sets for entities with recent activity
  const leadsWithActivityLast14d = new Set(
    activities
      .filter((a) => a.entity_type === "lead" && a.entity_id && a.created_at >= fourteenDaysAgoIso)
      .map((a) => a.entity_id as string)
  )

  const leadsWithActivityLast7d = new Set(
    activities
      .filter((a) => a.entity_type === "lead" && a.entity_id && a.created_at >= sevenDaysAgoIso)
      .map((a) => a.entity_id as string)
  )

  const customersWithActivityLast30d = new Set(
    activities
      .filter((a) => a.entity_type === "customer" && a.entity_id && a.created_at >= thirtyDaysAgoIso)
      .map((a) => a.entity_id as string)
  )

  const generatedInsights: BusinessInsight[] = []

  // ── Rule 1: Overdue Tasks ───────────────────────────────────────────────────
  for (const task of tasks) {
    const isOpen = task.status === "todo" || task.status === "in_progress"
    if (!isOpen || !task.due_date) continue

    const dueDateClean = task.due_date.slice(0, 10)
    if (dueDateClean < todayStr) {
      const isUrgent = task.priority === "urgent" || task.priority === "high"
      const isSeverelyOverdue = dueDateClean <= new Date(now.getTime() - 3 * 86400000).toISOString().slice(0, 10)
      const severity: InsightSeverity = isUrgent || isSeverelyOverdue ? "critical" : "warning"

      generatedInsights.push({
        id: `ins-task-overdue-${task.id}`,
        type: INSIGHT_TYPES.OVERDUE_TASK,
        severity,
        title: `Overdue Task: ${task.title}`,
        description: `Task has passed its due date (${dueDateClean}). Priority is ${task.priority.toUpperCase()} with status "${task.status}".`,
        entityType: "task",
        entityId: task.id,
        metadata: {
          dueDate: task.due_date,
          priority: task.priority,
          status: task.status,
        },
        recommendedAction: {
          label: "Complete or reschedule this task",
          actionType: "view",
          targetHref: "/tasks?due_date_filter=overdue",
          suggestedTool: "prepare_complete_task",
          suggestedPayload: { id: task.id },
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 2: Upcoming High/Urgent Tasks Due Soon ──────────────────────────────
  for (const task of tasks) {
    const isOpen = task.status === "todo" || task.status === "in_progress"
    if (!isOpen || !task.due_date) continue

    const dueDateClean = task.due_date.slice(0, 10)
    const isUpcomingWindow = dueDateClean >= todayStr && dueDateClean <= twoDaysAheadStr
    const isHighPriority = task.priority === "high" || task.priority === "urgent"

    if (isUpcomingWindow && isHighPriority) {
      const isDueToday = dueDateClean === todayStr
      generatedInsights.push({
        id: `ins-task-upcoming-${task.id}`,
        type: INSIGHT_TYPES.UPCOMING_TASK,
        severity: isDueToday ? "warning" : "info",
        title: `Upcoming Task Due: ${task.title}`,
        description: `Operational task marked ${task.priority.toUpperCase()} priority is due ${isDueToday ? "today" : `on ${dueDateClean}`}.`,
        entityType: "task",
        entityId: task.id,
        metadata: {
          dueDate: task.due_date,
          priority: task.priority,
          isDueToday,
        },
        recommendedAction: {
          label: "Review task requirements",
          actionType: "view",
          targetHref: `/tasks?priority=${task.priority}`,
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 3: Stale Leads ─────────────────────────────────────────────────────
  for (const lead of leads) {
    const isOpenLead = lead.status === "new" || lead.status === "contacted" || lead.status === "qualifying"
    if (!isOpenLead) continue

    const lastUpdated = lead.updated_at || lead.created_at
    const hasActivity = leadsWithActivityLast14d.has(lead.id)

    if (lastUpdated <= fourteenDaysAgoIso && !hasActivity) {
      const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "Unnamed Lead"
      generatedInsights.push({
        id: `ins-lead-stale-${lead.id}`,
        type: INSIGHT_TYPES.STALE_LEAD,
        severity: "warning",
        title: `Stale Lead: ${fullName}`,
        description: `Lead from ${lead.company || "independent prospect"} has been in "${lead.status}" stage for over 14 days with no recent updates.`,
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          status: lead.status,
          company: lead.company,
          lastUpdated,
        },
        recommendedAction: {
          label: "Follow up with this lead",
          actionType: "view",
          targetHref: "/leads",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 4: Active Qualifying Leads with Activity Gap (7 days) ──────────────
  for (const lead of leads) {
    // Only look at qualifying or contacted leads that are NOT already flagged as stale (>14d)
    const isQualifying = lead.status === "qualifying" || lead.status === "contacted"
    if (!isQualifying) continue

    const lastUpdated = lead.updated_at || lead.created_at
    const isRecentLead = lastUpdated > fourteenDaysAgoIso
    const hasRecentTouchpoint = leadsWithActivityLast7d.has(lead.id)

    if (isRecentLead && !hasRecentTouchpoint && lastUpdated <= sevenDaysAgoIso) {
      const fullName = `${lead.first_name} ${lead.last_name}`.trim() || "Prospect"
      generatedInsights.push({
        id: `ins-lead-inactive-${lead.id}`,
        type: INSIGHT_TYPES.HIGH_PRIORITY_LEAD_INACTIVE,
        severity: "warning",
        title: `Follow-up Gap on Lead: ${fullName}`,
        description: `Lead in "${lead.status}" stage has had no contact or activity logged in the past 7 days.`,
        entityType: "lead",
        entityId: lead.id,
        metadata: {
          status: lead.status,
          company: lead.company,
        },
        recommendedAction: {
          label: "Schedule outreach call or note",
          actionType: "view",
          targetHref: "/leads",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 5: Stale Deals Stuck in Stage ───────────────────────────────────────
  const OPEN_DEAL_STAGES = ["discovery", "proposal", "negotiation"]
  const openDeals = deals.filter((d) => OPEN_DEAL_STAGES.includes(d.stage))

  for (const deal of openDeals) {
    const lastUpdated = deal.updated_at || deal.created_at
    // Negotiation deals become stale after 14 days; others after 21 days
    const staleThreshold = deal.stage === "negotiation" ? fourteenDaysAgoIso : twentyOneDaysAgoIso

    if (lastUpdated <= staleThreshold) {
      const dealValue = Number(deal.value) || 0
      const severity: InsightSeverity = dealValue >= 20000 ? "critical" : "warning"

      generatedInsights.push({
        id: `ins-deal-stale-${deal.id}`,
        type: INSIGHT_TYPES.STALE_DEAL,
        severity,
        title: `Stalled Deal: ${deal.title}`,
        description: `Deal valued at $${dealValue.toLocaleString()} has been in the "${deal.stage}" stage without movement for over ${deal.stage === "negotiation" ? "14" : "21"} days.`,
        entityType: "deal",
        entityId: deal.id,
        metadata: {
          stage: deal.stage,
          value: dealValue,
          currency: deal.currency,
          lastUpdated,
        },
        recommendedAction: {
          label: "Review the deal and contact the customer",
          actionType: "view",
          targetHref: "/deals",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 6: Deals with Past or Immediate Close Dates ────────────────────────
  for (const deal of openDeals) {
    const closeDate = deal.expected_close || deal.expected_close_date
    if (!closeDate) continue

    const closeDateClean = closeDate.slice(0, 10)
    const dealValue = Number(deal.value) || 0

    if (closeDateClean < todayStr) {
      // Past expected close date
      generatedInsights.push({
        id: `ins-deal-closing-past-${deal.id}`,
        type: INSIGHT_TYPES.DEAL_CLOSING_SOON,
        severity: "critical",
        title: `Target Close Overdue: ${deal.title}`,
        description: `Deal ($${dealValue.toLocaleString()}) was targeted to close on ${closeDateClean} but is still in "${deal.stage}" stage.`,
        entityType: "deal",
        entityId: deal.id,
        metadata: {
          expectedClose: closeDateClean,
          stage: deal.stage,
          value: dealValue,
        },
        recommendedAction: {
          label: "Update close date or finalize agreement",
          actionType: "view",
          targetHref: "/deals",
        },
        createdAt: now.toISOString(),
      })
    } else if (closeDateClean <= sevenDaysAheadStr) {
      // Due within 7 days
      generatedInsights.push({
        id: `ins-deal-closing-soon-${deal.id}`,
        type: INSIGHT_TYPES.DEAL_CLOSING_SOON,
        severity: "warning",
        title: `Deal Closing Soon: ${deal.title}`,
        description: `Deal ($${dealValue.toLocaleString()}) target close date is in ${closeDateClean === todayStr ? "today" : closeDateClean}.`,
        entityType: "deal",
        entityId: deal.id,
        metadata: {
          expectedClose: closeDateClean,
          stage: deal.stage,
          value: dealValue,
        },
        recommendedAction: {
          label: "Confirm closing terms with client",
          actionType: "view",
          targetHref: "/deals",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 7: Inactive Customer Accounts ──────────────────────────────────────
  for (const customer of customers) {
    if (customer.status !== "active") continue

    const lastUpdated = customer.updated_at || customer.created_at
    const hasRecentActivity = customersWithActivityLast30d.has(customer.id)

    if (lastUpdated <= thirtyDaysAgoIso && !hasRecentActivity) {
      const isOver60Days = lastUpdated <= new Date(now.getTime() - 60 * 86400000).toISOString()
      generatedInsights.push({
        id: `ins-customer-inactive-${customer.id}`,
        type: INSIGHT_TYPES.INACTIVE_CUSTOMER,
        severity: isOver60Days ? "warning" : "info",
        title: `Inactive Customer: ${customer.name}`,
        description: `Account has had no recorded touchpoints, deals, or activity logged in the past ${isOver60Days ? "60" : "30"} days.`,
        entityType: "customer",
        entityId: customer.id,
        metadata: {
          industry: customer.industry,
          status: customer.status,
          lastUpdated,
        },
        recommendedAction: {
          label: "Conduct account health check",
          actionType: "view",
          targetHref: "/customers",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 8: Pipeline Concentration Risk ─────────────────────────────────────
  if (openDeals.length >= 2) {
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
    if (totalPipelineValue > 0) {
      // Find maximum single deal
      let maxDeal = openDeals[0]
      for (const d of openDeals) {
        if ((Number(d.value) || 0) > (Number(maxDeal.value) || 0)) {
          maxDeal = d
        }
      }

      const maxValue = Number(maxDeal.value) || 0
      const concentrationPct = Math.round((maxValue / totalPipelineValue) * 100)

      if (concentrationPct >= 40) {
        generatedInsights.push({
          id: `ins-pipeline-concentration-${maxDeal.id}`,
          type: INSIGHT_TYPES.PIPELINE_RISK,
          severity: "warning",
          title: `Pipeline Concentration Risk (${concentrationPct}%)`,
          description: `Single deal "${maxDeal.title}" accounts for ${concentrationPct}% of your total active pipeline ($${maxValue.toLocaleString()} of $${totalPipelineValue.toLocaleString()}).`,
          entityType: "pipeline",
          entityId: maxDeal.id,
          metadata: {
            dominantDealId: maxDeal.id,
            dominantDealTitle: maxDeal.title,
            dominantDealValue: maxValue,
            totalPipelineValue,
            concentrationPct,
          },
          recommendedAction: {
            label: "Diversify pipeline to reduce single-deal reliance",
            actionType: "view",
            targetHref: "/deals",
          },
          createdAt: now.toISOString(),
        })
      }
    }
  }

  // ── Rule 9: Activity Logging Gap ────────────────────────────────────────────
  const hasActiveCRMData = leads.length > 0 || openDeals.length > 0 || tasks.length > 0
  if (hasActiveCRMData) {
    const latestActivity = activities[0]
    const isGap = !latestActivity || latestActivity.created_at <= threeDaysAgoIso

    if (isGap) {
      generatedInsights.push({
        id: `ins-activity-gap-${organizationId}`,
        type: INSIGHT_TYPES.ACTIVITY_GAP,
        severity: "info",
        title: "Activity Logging Gap Detected",
        description: "No customer communications, status updates, or task logs have been recorded in over 3 business days.",
        entityType: "activity",
        entityId: null,
        recommendedAction: {
          label: "Log recent calls or meeting notes",
          actionType: "view",
          targetHref: "/activities",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // ── Rule 10: Conversion Trend Anomaly ───────────────────────────────────────
  if (leads.length >= 8) {
    const convertedCount = customers.filter((c) => c.converted_from_lead_id !== null).length
    const conversionRate = Math.round((convertedCount / leads.length) * 100)

    if (conversionRate < 10) {
      generatedInsights.push({
        id: `ins-conversion-low-${organizationId}`,
        type: INSIGHT_TYPES.CONVERSION_CHANGE,
        severity: "info",
        title: `Low Lead Conversion Velocity (${conversionRate}%)`,
        description: `Your organization has recorded ${convertedCount} conversions across ${leads.length} leads. Review qualification criteria to optimize pipeline flow.`,
        entityType: "organization",
        entityId: null,
        metadata: {
          totalLeads: leads.length,
          convertedCount,
          conversionRate,
        },
        recommendedAction: {
          label: "Review qualification criteria and prospect fit",
          actionType: "view",
          targetHref: "/leads",
        },
        createdAt: now.toISOString(),
      })
    }
  }

  // 4. Deterministic Sort: Critical -> Warning -> Info, then by title
  const SEVERITY_WEIGHT: Record<InsightSeverity, number> = {
    critical: 3,
    warning: 2,
    info: 1,
  }

  generatedInsights.sort((a, b) => {
    const weightDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]
    if (weightDiff !== 0) return weightDiff
    return a.title.localeCompare(b.title)
  })

  // 5. Generate Hallucination-Free Business Briefing
  const briefing = generateBusinessBriefing(generatedInsights)

  const fullResult: InsightsResult = {
    briefing,
    insights: generatedInsights,
    total: generatedInsights.length,
  }

  // 6. Save to cache
  insightsCache.set(organizationId, {
    data: fullResult,
    timestamp: Date.now(),
  })

  return filterInsightsResult(fullResult, severity, limit)
}

// ── Briefing Generator (Deterministic & Grounded) ─────────────────────────────

/**
 * Builds a concise, executive business briefing directly from the calculated insights.
 * Guarantees zero invented metrics or hallucinated counts.
 */
export function generateBusinessBriefing(insights: BusinessInsight[]): BusinessBriefing {
  const criticalCount = insights.filter((i) => i.severity === "critical").length
  const warningCount = insights.filter((i) => i.severity === "warning").length
  const infoCount = insights.filter((i) => i.severity === "info").length

  const overdueTasksCount = insights.filter((i) => i.type === INSIGHT_TYPES.OVERDUE_TASK).length
  const staleLeadsCount = insights.filter((i) => i.type === INSIGHT_TYPES.STALE_LEAD).length
  const staleDealsCount = insights.filter((i) => i.type === INSIGHT_TYPES.STALE_DEAL).length
  const inactiveCustomersCount = insights.filter((i) => i.type === INSIGHT_TYPES.INACTIVE_CUSTOMER).length

  const totalInsights = insights.length
  const nowIso = new Date().toISOString()

  if (totalInsights === 0) {
    return {
      headline: "All Operations On Track",
      summary: "No overdue tasks, stalled deals, or stale customer accounts detected. Your operations are running smoothly.",
      metrics: {
        totalInsights: 0,
        criticalCount: 0,
        warningCount: 0,
        infoCount: 0,
        overdueTasksCount: 0,
        staleLeadsCount: 0,
        staleDealsCount: 0,
        inactiveCustomersCount: 0,
      },
      keyFindings: [
        "No overdue operational tasks requiring escalation.",
        "Sales pipeline and active deals are moving without stage delays.",
        "Customer accounts have active touchpoints recorded.",
      ],
      generatedAt: nowIso,
    }
  }

  // Headline reflecting top severity
  let headline = "Business Intelligence Briefing"
  if (criticalCount > 0) {
    headline = `${criticalCount} Critical ${criticalCount === 1 ? "Item" : "Items"} Requiring Immediate Attention`
  } else if (warningCount > 0) {
    headline = `${warningCount} Operational ${warningCount === 1 ? "Warning" : "Warnings"} Identified`
  } else {
    headline = `${infoCount} Operational ${infoCount === 1 ? "Notice" : "Notices"} Available`
  }

  // Construct factual summary sentence with exact counts
  const summaryParts: string[] = []
  if (overdueTasksCount > 0) {
    summaryParts.push(`${overdueTasksCount} overdue ${overdueTasksCount === 1 ? "task" : "tasks"}`)
  }
  if (staleLeadsCount > 0) {
    summaryParts.push(`${staleLeadsCount} stale ${staleLeadsCount === 1 ? "lead" : "leads"} requiring follow-up`)
  }
  if (staleDealsCount > 0) {
    summaryParts.push(`${staleDealsCount} stalled ${staleDealsCount === 1 ? "deal" : "deals"}`)
  }
  if (inactiveCustomersCount > 0) {
    summaryParts.push(`${inactiveCustomersCount} inactive customer ${inactiveCustomersCount === 1 ? "account" : "accounts"}`)
  }

  let summary = `Detected ${totalInsights} active business ${totalInsights === 1 ? "signal" : "signals"}.`
  if (summaryParts.length > 0) {
    summary = `Today you have ${summaryParts.join(", ")}, with ${criticalCount} critical priorities.`
  }

  // Key findings: top 4 insights
  const keyFindings = insights.slice(0, 4).map((item) => {
    return `${item.title}: ${item.description}`
  })

  return {
    headline,
    summary,
    metrics: {
      totalInsights,
      criticalCount,
      warningCount,
      infoCount,
      overdueTasksCount,
      staleLeadsCount,
      staleDealsCount,
      inactiveCustomersCount,
    },
    keyFindings,
    generatedAt: nowIso,
  }
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

function filterInsightsResult(
  result: InsightsResult,
  severityFilter: InsightSeverity | "all",
  limit: number
): InsightsResult {
  let filtered = result.insights

  if (severityFilter !== "all") {
    filtered = filtered.filter((i) => i.severity === severityFilter)
  }

  filtered = filtered.slice(0, limit)

  return {
    briefing: result.briefing,
    insights: filtered,
    total: filtered.length,
  }
}
