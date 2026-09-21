"use client"

import * as React from "react"
import { Bot, Sparkles, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { MOCK_AI_INSIGHTS } from "@/lib/mock/dashboard-data"

const SEVERITY_ICONS = {
  warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  opportunity: <Lightbulb className="h-4 w-4 text-blue-600" />,
  info: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
}

export function AIInsightsPanel() {
  const [executedActions, setExecutedActions] = React.useState<Record<string, boolean>>({})

  const handleSimulateAction = (id: string) => {
    setExecutedActions((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <Card className="border-primary/20 bg-linear-to-b from-primary/5 via-card to-card shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
              <Sparkles className="h-3 w-3" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Autonomous Intelligence Feed
            </CardTitle>
            <Badge variant="outline" className="text-[10px] bg-background text-primary font-mono border-primary/30">
              AI SDK 7.0 Active
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Synthesized business anomalies, deal velocity signals, and human-in-the-loop actions.
          </CardDescription>
        </div>
        <a
          href="/ai"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs h-7 gap-1" })}
        >
          <span>Open Assistant</span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {MOCK_AI_INSIGHTS.map((insight) => {
          const isDone = executedActions[insight.id]

          return (
            <div
              key={insight.id}
              className="rounded-lg border border-border/80 bg-background/80 p-3.5 space-y-2.5 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {SEVERITY_ICONS[insight.severity]}
                  <span className="text-xs font-semibold text-foreground">
                    {insight.title}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] uppercase font-mono px-1.5 py-0 h-4"
                >
                  {insight.severity}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {insight.summary}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Action:</span>
                  <span className="truncate">{insight.recommendedAction}</span>
                </div>

                {insight.actionToolName && (
                  <Button
                    size="sm"
                    variant={isDone ? "outline" : "default"}
                    className="h-7 text-xs self-end sm:self-auto gap-1"
                    onClick={() => handleSimulateAction(insight.id)}
                    disabled={isDone}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Action Staged</span>
                      </>
                    ) : (
                      <>
                        <Bot className="h-3 w-3" />
                        <span>Approve Tool Action</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
