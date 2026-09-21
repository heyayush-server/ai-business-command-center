"use client"

import * as React from "react"
import {
  Sparkles,
  Clock,
  ArrowRight,
  BellRing,
  RotateCcw,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface InsightCard {
  id: string
  title: string
  detail: string
  severity: "critical" | "warning" | "info"
  badge: string
  action: string
}

const INSIGHTS_LIST: InsightCard[] = [
  {
    id: "ins-1",
    title: "3 tasks are overdue",
    detail: "High-priority client deliverables missed their scheduled due date.",
    severity: "critical",
    badge: "Overdue Tasks",
    action: "Reschedule or complete tasks",
  },
  {
    id: "ins-2",
    title: "4 leads need follow-up",
    detail: "Qualified prospects have had zero team communication for over 10 days.",
    severity: "warning",
    badge: "Stale Leads",
    action: "Review leads needing touchpoint",
  },
  {
    id: "ins-3",
    title: "1 deal has been inactive for 14 days",
    detail: "CloudScale Systems ($48,000) has had no stage movement or email updates.",
    severity: "warning",
    badge: "Stalled Deal",
    action: "Schedule follow-up meeting",
  },
  {
    id: "ins-4",
    title: "One deal represents a large part of your pipeline",
    detail: "A single enterprise opportunity accounts for 48% of total active pipeline value.",
    severity: "info",
    badge: "Pipeline Risk",
    action: "Diversify sales pipeline",
  },
]

export function ProactiveInsightsSection() {
  const [scanned, setScanned] = React.useState<boolean>(true)

  return (
    <section id="insights" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Proactive Business Intelligence</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Don&apos;t Wait for Problems to Find You.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Know what needs attention before you ask. The Command Center continuously checks your CRM data and surfaces priority items every morning.
          </p>
        </div>

        {/* Proactive Stage Sandbox Container */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Top Bar: Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/40 px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Automated Health Check
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground">
                {scanned ? "4 priority signals detected" : "Simulate morning business scan"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScanned(!scanned)}
                className="h-7 text-xs gap-1.5"
              >
                {scanned ? (
                  <>
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>Run Morning Scan</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8 bg-background/50">
            {/* "Today's Attention" Banner Area */}
            <div
              className={`rounded-xl border p-4 sm:p-5 transition-all duration-500 ${
                scanned
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                      Today&apos;s Attention
                    </span>
                    {scanned && (
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {scanned
                      ? "1 Critical Priority & 3 Items to Review"
                      : "All systems nominal • Click 'Run Morning Scan' to check for risks"}
                  </h3>
                </div>

                {scanned && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="destructive" className="text-xs font-mono">1 Critical</Badge>
                    <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">2 Warnings</Badge>
                    <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">1 Attention</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* The 4 Insight Cards */}
            {scanned ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
                {INSIGHTS_LIST.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-xs transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.severity === "critical" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                        )}
                        {item.severity === "warning" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        )}
                        {item.severity === "info" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        )}
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          {item.badge}
                        </span>
                      </div>
                      <Badge
                        variant={item.severity === "critical" ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {item.severity === "critical" ? "High Priority" : "Review"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.detail}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-primary font-medium hover:underline cursor-pointer">
                      <span>{item.action}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Baseline Dashboard Mode
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Click &ldquo;Run Morning Scan&rdquo; to watch proactive business intelligence analyze current data and flag stalled deals and overdue items.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
