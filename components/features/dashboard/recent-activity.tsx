import React from "react"
import { Activity, Bot, User, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_RECENT_ACTIVITIES } from "@/lib/mock/dashboard-data"

export function RecentActivity() {
  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Audit &amp; Activity Stream
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              Live Feed
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Chronological log of operations executed by team members and AI tools.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Activity className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {MOCK_RECENT_ACTIVITIES.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-border/40 p-2.5 hover:bg-muted/20 transition-colors"
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                activity.actorType === "ai"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {activity.actorType === "ai" ? (
                <Bot className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground truncate">
                  {activity.actorName}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 font-mono">
                  <Clock className="h-3 w-3" />
                  {activity.timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-snug">
                {activity.action} <span className="font-medium text-foreground">{activity.entityName}</span>
              </p>
              {activity.details && (
                <p className="text-[11px] text-muted-foreground/80 bg-muted/30 rounded px-2 py-1 font-mono mt-1">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-border/60">
          <a
            href="/activities"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>View complete immutable audit log</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
