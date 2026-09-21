/**
 * Mock data for Phase 0 visual dashboard demonstration.
 * In Phase 4+, this will be replaced with real Supabase queries
 * and real-time subscriptions scoped by organization_id.
 */

export interface MetricSummary {
  label: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  subtext: string
  iconName: string
}

export interface ActivityItem {
  id: string
  actorName: string
  actorType: "user" | "ai"
  action: string
  entityName: string
  timestamp: string
  details?: string
}

export interface DueTask {
  id: string
  title: string
  dueDate: string
  priority: "high" | "medium" | "low"
  relatedEntity: string
  entityType: "deal" | "lead" | "customer"
  assignedTo: string
}

export interface AIInsight {
  id: string
  title: string
  severity: "info" | "warning" | "opportunity"
  summary: string
  recommendedAction: string
  actionToolName?: string
  actionPayload?: Record<string, unknown>
}

export interface PipelineStage {
  stage: string
  count: number
  value: number
  color: string
}

export const MOCK_METRICS: MetricSummary[] = [
  {
    label: "Monthly Revenue",
    value: "$48,250",
    change: "+12.4%",
    trend: "up",
    subtext: "vs. prior 30 days ($42,900)",
    iconName: "DollarSign",
  },
  {
    label: "Total Leads",
    value: "142",
    change: "+18.2%",
    trend: "up",
    subtext: "34 qualified this month",
    iconName: "UserPlus",
  },
  {
    label: "Active Customers",
    value: "89",
    change: "+4.7%",
    trend: "up",
    subtext: "99.1% retention rate",
    iconName: "Building2",
  },
  {
    label: "Open Tasks",
    value: "27",
    change: "-5",
    trend: "neutral",
    subtext: "6 due in the next 48h",
    iconName: "CheckSquare",
  },
  {
    label: "Pipeline Value",
    value: "$342,000",
    change: "+$45k",
    trend: "up",
    subtext: "Across 18 active deals",
    iconName: "TrendingUp",
  },
]

export const MOCK_PIPELINE_STAGES: PipelineStage[] = [
  { stage: "Lead Qualification", count: 8, value: 45000, color: "bg-blue-500" },
  { stage: "Discovery & Demo", count: 5, value: 92000, color: "bg-indigo-500" },
  { stage: "Proposal / Pricing", count: 3, value: 125000, color: "bg-amber-500" },
  { stage: "Negotiation", count: 2, value: 80000, color: "bg-purple-500" },
]

export const MOCK_LEAD_CONVERSION = [
  { source: "Inbound Organic", leads: 58, converted: 18, rate: "31.0%" },
  { source: "AI Outbound Campaign", leads: 44, converted: 12, rate: "27.2%" },
  { source: "Partner Referrals", leads: 24, converted: 11, rate: "45.8%" },
  { source: "Product Signups", leads: 16, converted: 7, rate: "43.7%" },
]

export const MOCK_RECENT_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-1",
    actorName: "AI Assistant",
    actorType: "ai",
    action: "Generated follow-up briefing for",
    entityName: "CloudScale Systems",
    timestamp: "12 minutes ago",
    details: "Detected 4 days of inactivity after initial product demo.",
  },
  {
    id: "act-2",
    actorName: "Ishan",
    actorType: "user",
    action: "Moved deal to Proposal Review:",
    entityName: "Acme Corp Expansion ($65,000)",
    timestamp: "45 minutes ago",
  },
  {
    id: "act-3",
    actorName: "Sarah Connor",
    actorType: "user",
    action: "Created new qualified customer account:",
    entityName: "Apex Logistics Inc",
    timestamp: "2 hours ago",
  },
  {
    id: "act-4",
    actorName: "AI Assistant",
    actorType: "ai",
    action: "Staged tool action for human approval:",
    entityName: "Update deal stage & notify team",
    timestamp: "3 hours ago",
    details: "Pending action ID: act_98a7 (Awaiting supervisor signature)",
  },
  {
    id: "act-5",
    actorName: "Ishan",
    actorType: "user",
    action: "Completed critical operational task:",
    entityName: "Send SOC2 Security Packet to FinCorp",
    timestamp: "5 hours ago",
  },
]

export const MOCK_DUE_TASKS: DueTask[] = [
  {
    id: "tsk-1",
    title: "Send revised MSA & contract agreement",
    dueDate: "Today, 5:00 PM",
    priority: "high",
    relatedEntity: "Stripe Integrations Deal",
    entityType: "deal",
    assignedTo: "Ishan",
  },
  {
    id: "tsk-2",
    title: "Conduct onboarding discovery call",
    dueDate: "Tomorrow, 11:00 AM",
    priority: "medium",
    relatedEntity: "Apex Logistics Inc",
    entityType: "customer",
    assignedTo: "Sarah Connor",
  },
  {
    id: "tsk-3",
    title: "Review customer Q3 consumption & plan upgrade",
    dueDate: "Tomorrow, 3:30 PM",
    priority: "medium",
    relatedEntity: "GlobalRetail Ltd",
    entityType: "customer",
    assignedTo: "Ishan",
  },
  {
    id: "tsk-4",
    title: "Inbound qualification review for seed prospect",
    dueDate: "Sep 24, 2026",
    priority: "low",
    relatedEntity: "VenturePulse Inc",
    entityType: "lead",
    assignedTo: "AI Triage Queue",
  },
]

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  {
    id: "ins-1",
    title: "Deal Slippage Alert: FinCorp Cloud Migration",
    severity: "warning",
    summary: "Deal has been stuck in 'Proposal' stage for 18 days (median is 6 days). Expected close date is in 4 days.",
    recommendedAction: "Trigger executive re-engagement briefing or request AI draft of check-in note.",
    actionToolName: "draftReengagementEmail",
    actionPayload: { dealId: "dl_fincorp_01" },
  },
  {
    id: "ins-2",
    title: "High-Intent Lead Inbound Detected",
    severity: "opportunity",
    summary: "New lead 'Northwind Tech' matches high-LTV ICP criteria with 3 team members viewing pricing page.",
    recommendedAction: "Assign directly to Senior Account Exec and schedule same-day qualification.",
    actionToolName: "assignLeadPriority",
    actionPayload: { leadId: "ld_northwind_03" },
  },
  {
    id: "ins-3",
    title: "Pipeline Coverage Healthy (3.2x)",
    severity: "info",
    summary: "Current active pipeline covers $342k against the monthly quota of $105k. Win-rate forecast is on track.",
    recommendedAction: "Maintain velocity on mid-stage discovery calls.",
  },
]
