"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  MessageSquareText,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import type { BusinessInsight, BusinessBriefing, InsightSeverity } from "@/lib/types/insights"

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    icon: React.ReactNode
    badgeVariant: "destructive" | "default" | "secondary" | "outline"
    badgeClass: string
    borderClass: string
  }
> = {
  critical: {
    icon: <AlertOctagon className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    badgeVariant: "destructive",
    badgeClass: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    borderClass: "border-rose-500/30 bg-rose-500/5",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    badgeVariant: "secondary",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    borderClass: "border-amber-500/30 bg-amber-500/5",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />,
    badgeVariant: "outline",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    borderClass: "border-blue-500/30 bg-blue-500/5",
  },
}

interface AIInsightsPanelProps {
  insights: BusinessInsight[]
  briefing: BusinessBriefing
}

export function AIInsightsPanel({ insights, briefing }: AIInsightsPanelProps) {
  const [filter, setFilter] = React.useState<InsightSeverity | "all">("all")

  const filteredInsights = React.useMemo(() => {
    if (filter === "all") return insights
    return insights.filter((i) => i.severity === filter)
  }, [insights, filter])

  return (
    <Card className="border-primary/25 bg-linear-to-b from-primary/5 via-card to-card shadow-xs">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Proactive Business Intelligence
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-background text-primary font-mono border-primary/30">
              Phase 14 Active
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Deterministic signals, overdue SLA bottlenecks, deal velocity risks, and suggested actions.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/ai"
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs h-8 gap-1.5" })}
          >
            <MessageSquareText className="h-3.5 w-3.5 text-primary" />
            <span>Consult Copilot</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Executive Business Briefing Banner */}
        <div className="rounded-lg border border-primary/20 bg-background/90 p-3.5 space-y-2 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-foreground tracking-tight">
              {briefing.headline}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {briefing.metrics.criticalCount > 0 && (
                <Badge variant="outline" className="text-[10px] font-mono bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
                  {briefing.metrics.criticalCount} Critical
                </Badge>
              )}
              {briefing.metrics.warningCount > 0 && (
                <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  {briefing.metrics.warningCount} Warnings
                </Badge>
              )}
              {briefing.metrics.infoCount > 0 && (
                <Badge variant="outline" className="text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                  {briefing.metrics.infoCount} Info
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {briefing.summary}
          </p>
        </div>

        {/* Filter Tabs */}
        {insights.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              All ({insights.length})
            </button>
            {briefing.metrics.criticalCount > 0 && (
              <button
                onClick={() => setFilter("critical")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filter === "critical"
                    ? "bg-rose-600 text-white"
                    : "text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                }`}
              >
                Critical ({briefing.metrics.criticalCount})
              </button>
            )}
            {briefing.metrics.warningCount > 0 && (
              <button
                onClick={() => setFilter("warning")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filter === "warning"
                    ? "bg-amber-600 text-white"
                    : "text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                }`}
              >
                Warnings ({briefing.metrics.warningCount})
              </button>
            )}
            {briefing.metrics.infoCount > 0 && (
              <button
                onClick={() => setFilter("info")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filter === "info"
                    ? "bg-blue-600 text-white"
                    : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                }`}
              >
                Info ({briefing.metrics.infoCount})
              </button>
            )}
          </div>
        )}

        {/* Insight Cards */}
        {filteredInsights.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-lg border border-dashed border-border bg-background/50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-sm font-medium text-foreground">
              {filter === "all" ? "No business bottlenecks detected" : `No ${filter} insights active`}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              All CRM operations, deal stages, and task deadlines are currently healthy and on track.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredInsights.slice(0, 6).map((insight) => {
              const cfg = SEVERITY_CONFIG[insight.severity]

              // Resolve human-friendly entity button label
              const entityViewLabel =
                insight.entityType === "lead"
                  ? "View Lead"
                  : insight.entityType === "deal"
                  ? "View Deal"
                  : insight.entityType === "task"
                  ? "View Task"
                  : insight.entityType === "customer"
                  ? "View Account"
                  : insight.entityType === "activity"
                  ? "View Audit Log"
                  : "View Details"

              return (
                <div
                  key={insight.id}
                  className={`rounded-lg border p-3 space-y-2 transition-all shadow-2xs ${cfg.borderClass} bg-background/90`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className="text-xs font-semibold text-foreground leading-tight">
                        {insight.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[9px] uppercase font-mono px-1.5 py-0 h-4">
                        {insight.entityType}
                      </Badge>
                      <Badge
                        variant={cfg.badgeVariant}
                        className={`text-[9px] uppercase font-mono px-1.5 py-0 h-4 ${cfg.badgeClass}`}
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    {insight.description}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/40 pl-6">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Recommendation:</span>
                      <span className="truncate">
                        {insight.recommendedAction?.label || "Review and monitor"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {insight.recommendedAction?.targetHref && (
                        <Link
                          href={insight.recommendedAction.targetHref}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                            className: "h-6 text-[11px] px-2 gap-1",
                          })}
                        >
                          <span>{entityViewLabel}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      )}

                      <Link
                        href={`/ai?prompt=${encodeURIComponent(`Regarding insight "${insight.title}": ${insight.recommendedAction?.label || "What action should be taken?"}`)}`}
                        className={buttonVariants({
                          variant: "ghost",
                          size: "sm",
                          className: "h-6 text-[11px] px-2 text-primary gap-1",
                        })}
                      >
                        <span>Prepare Action</span>
                        <ArrowRight className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
