import React from "react"
import Link from "next/link"
import { BarChart3, ChevronRight, Inbox } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DashboardData } from "@/lib/services/dashboard.service"

interface SalesPipelineChartProps {
  pipeline: DashboardData["pipeline"]
}

export function SalesPipelineChart({ pipeline }: SalesPipelineChartProps) {
  const { stages, totalValue, totalDeals } = pipeline
  const activeStagesCount = stages.filter((s) => s.count > 0).length

  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Sales Pipeline by Stage
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              {activeStagesCount} Active {activeStagesCount === 1 ? "Stage" : "Stages"}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Volume and value distribution across sales stages.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted/50 px-2.5 py-1 rounded-md">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>${totalValue.toLocaleString()} Active Pipeline</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {totalDeals === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Inbox className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-medium text-foreground">No deals in pipeline</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Create your first deal to track stage velocity and deal value.
            </p>
          </div>
        ) : (
          <>
            {/* Visual Stacked Progress Bar */}
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60">
              {stages.map((stage) => {
                if (stage.count === 0 && stage.totalValue === 0) return null
                const widthPct = stage.percentage > 0 ? stage.percentage : Math.max(4, Math.round((stage.count / totalDeals) * 100))
                return (
                  <div
                    key={stage.stage}
                    style={{ width: `${widthPct}%` }}
                    className={`${stage.color} transition-all`}
                    title={`${stage.label}: ${stage.count} deals ($${stage.totalValue.toLocaleString()})`}
                  />
                )
              })}
            </div>

            {/* Stage List Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {stages.map((stage) => {
                return (
                  <div
                    key={stage.stage}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${stage.color}`} />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {stage.count} {stage.count === 1 ? "deal" : "deals"}
                        {totalDeals > 0 && ` • ${Math.round((stage.count / totalDeals) * 100)}% volume`}
                      </span>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="text-xs font-bold text-foreground block">
                        ${stage.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/50">
          <span>{totalDeals} Total Deal Records</span>
          <Link
            href="/deals"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Open pipeline board</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
