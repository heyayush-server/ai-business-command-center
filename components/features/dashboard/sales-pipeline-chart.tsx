import React from "react"
import { BarChart3, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_PIPELINE_STAGES } from "@/lib/mock/dashboard-data"

export function SalesPipelineChart() {
  const totalPipeline = MOCK_PIPELINE_STAGES.reduce((acc, stage) => acc + stage.value, 0)

  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Sales Pipeline by Stage
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              4 Active Stages
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Weighted deal values and volume through the sales funnel.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span>${(totalPipeline / 1000).toFixed(0)}k Total</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {/* Visual Stacked Progress Bar */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/60">
          {MOCK_PIPELINE_STAGES.map((stage) => {
            const widthPct = (stage.value / totalPipeline) * 100
            return (
              <div
                key={stage.stage}
                style={{ width: `${widthPct}%` }}
                className={`${stage.color} transition-all`}
                title={`${stage.stage}: $${stage.value.toLocaleString()}`}
              />
            )
          })}
        </div>

        {/* Stage List Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {MOCK_PIPELINE_STAGES.map((stage) => {
            const pct = Math.round((stage.value / totalPipeline) * 100)

            return (
              <div
                key={stage.stage}
                className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                    <span className="text-xs font-semibold text-foreground">{stage.stage}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {stage.count} {stage.count === 1 ? "deal" : "deals"} • {pct}% of pipeline
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-foreground">
                    ${stage.value.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span>Target Close Window: Next 30–60 Days</span>
          <a href="/deals" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            View full pipeline board <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
