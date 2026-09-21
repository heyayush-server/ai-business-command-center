"use client"

import * as React from "react"
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const SAMPLE_INSIGHTS = [
  {
    type: "OVERDUE_TASK",
    severity: "critical" as const,
    title: "Overdue Task: Finalize MSA terms with FinCorp",
    description: "Task was due yesterday. High priority operational item assigned to Account Executive.",
    entity: "Task #tsk-102",
    action: "Complete or reschedule this task",
  },
  {
    type: "STALE_DEAL",
    severity: "critical" as const,
    title: "Stalled Deal: CloudScale Systems Migration ($48,000)",
    description: "High-value deal in 'Proposal' stage has had no stage progression or touchpoints in 22 days.",
    entity: "Deal #dl-98a",
    action: "Review deal and contact customer",
  },
  {
    type: "STALE_LEAD",
    severity: "warning" as const,
    title: "Stale Lead: Apex Logistics Inc (Marcus Vance)",
    description: "Enterprise prospect in 'qualifying' stage untouched for over 14 days without activity.",
    entity: "Lead #ld-44b",
    action: "Follow up with this lead",
  },
  {
    type: "PIPELINE_RISK",
    severity: "warning" as const,
    title: "Pipeline Concentration Risk (48%)",
    description: "Single deal 'Enterprise ERP Suite' represents 48% of total active pipeline value ($68k of $142k).",
    entity: "Pipeline",
    action: "Diversify sales pipeline",
  },
  {
    type: "INACTIVE_CUSTOMER",
    severity: "info" as const,
    title: "Inactive Customer: Meridian BioTech",
    description: "Active corporate account with no recorded meetings, calls, or tickets in the past 35 days.",
    entity: "Customer #c-12",
    action: "Schedule quarterly health check",
  },
  {
    type: "ACTIVITY_GAP",
    severity: "info" as const,
    title: "Organization Activity Logging Gap",
    description: "No customer communications or operational updates have been logged in over 3 business days.",
    entity: "Organization",
    action: "Log recent calls or notes",
  },
]

export function ProactiveInsightsSection() {
  return (
    <section id="insights" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Phase 14 Proactive Business Intelligence</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Signals Before Slippage: Continuous Anomaly Detection
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            The Command Center doesn&apos;t wait for you to ask what&apos;s wrong. It actively scans your CRM data and surfaces grounded, deterministic insights with zero hallucinated metrics.
          </p>
        </div>

        {/* Executive Briefing Banner Showcase */}
        <div className="rounded-2xl border border-primary/25 bg-linear-to-r from-primary/10 via-card to-card p-6 sm:p-8 shadow-md mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-primary uppercase tracking-wider font-semibold">
                Autonomous Executive Briefing
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                2 Critical Priorities &amp; 3 Operational Warnings Identified
              </h3>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="destructive" className="text-xs font-mono">2 Critical</Badge>
              <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">3 Warnings</Badge>
              <Badge variant="outline" className="text-xs font-mono border-blue-500/30 text-blue-600 bg-blue-500/10">2 Info</Badge>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            &quot;Today your organization has 1 overdue high-priority task, 1 stalled enterprise deal exceeding SLA thresholds, 3 stale leads requiring follow-up, and 1 inactive corporate account.&quot;
          </p>
        </div>

        {/* Insights Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_INSIGHTS.map((insight) => {
            const isCrit = insight.severity === "critical"
            const isWarn = insight.severity === "warning"

            return (
              <div
                key={insight.title}
                className={`rounded-xl border p-5 space-y-3 shadow-2xs transition-all duration-200 hover:shadow-xs bg-card ${
                  isCrit
                    ? "border-rose-500/30 bg-rose-500/5"
                    : isWarn
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-blue-500/30 bg-blue-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isCrit && <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />}
                    {isWarn && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
                    {!isCrit && !isWarn && <Info className="h-4 w-4 text-blue-600 shrink-0" />}
                    <Badge
                      variant={isCrit ? "destructive" : isWarn ? "secondary" : "outline"}
                      className="text-[9px] font-mono uppercase px-1.5 py-0"
                    >
                      {insight.severity}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{insight.entity}</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground leading-snug">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>

                <div className="pt-2 border-t border-border/40 text-[11px] flex items-center justify-between text-muted-foreground">
                  <span className="font-medium text-foreground">Action: {insight.action}</span>
                  <ArrowRight className="h-3 w-3 text-primary" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
