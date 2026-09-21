/**
 * lib/types/insights.ts
 *
 * Central typed definitions for Phase 14: AI Business Intelligence & Proactive Insights.
 * Avoids magic strings and ensures deterministic, strictly typed insight generation.
 */

export const INSIGHT_TYPES = {
  OVERDUE_TASK: "OVERDUE_TASK",
  UPCOMING_TASK: "UPCOMING_TASK",
  STALE_LEAD: "STALE_LEAD",
  HIGH_PRIORITY_LEAD_INACTIVE: "HIGH_PRIORITY_LEAD_INACTIVE",
  STALE_DEAL: "STALE_DEAL",
  DEAL_CLOSING_SOON: "DEAL_CLOSING_SOON",
  INACTIVE_CUSTOMER: "INACTIVE_CUSTOMER",
  PIPELINE_RISK: "PIPELINE_RISK",
  CONVERSION_CHANGE: "CONVERSION_CHANGE",
  ACTIVITY_GAP: "ACTIVITY_GAP",
} as const

export type InsightType = (typeof INSIGHT_TYPES)[keyof typeof INSIGHT_TYPES]

export type InsightSeverity = "info" | "warning" | "critical"

export type InsightEntityType =
  | "task"
  | "lead"
  | "deal"
  | "customer"
  | "pipeline"
  | "activity"
  | "organization"

export interface InsightRecommendedAction {
  label: string
  actionType: "view" | "prepare_action"
  targetHref?: string
  suggestedTool?: string
  suggestedPayload?: Record<string, unknown>
}

export interface BusinessInsight {
  id: string
  type: InsightType
  severity: InsightSeverity
  title: string
  description: string
  entityType: InsightEntityType
  entityId: string | null
  metadata?: Record<string, unknown>
  recommendedAction?: InsightRecommendedAction
  createdAt: string
}

export interface BusinessBriefing {
  headline: string
  summary: string
  metrics: {
    totalInsights: number
    criticalCount: number
    warningCount: number
    infoCount: number
    overdueTasksCount: number
    staleLeadsCount: number
    staleDealsCount: number
    inactiveCustomersCount: number
  }
  keyFindings: string[]
  generatedAt: string
}

export interface InsightsResult {
  briefing: BusinessBriefing
  insights: BusinessInsight[]
  total: number
}
