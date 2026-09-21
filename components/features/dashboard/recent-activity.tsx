import React from "react"
import Link from "next/link"
import { Activity, Bot, User, Clock, ArrowRight, Inbox, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ActivityWithDetails } from "@/lib/services/activities.service"

interface RecentActivityProps {
  activities: ActivityWithDetails[]
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toISOString().slice(0, 10)
  } catch {
    return dateString
  }
}

export function RecentActivity({ activities }: RecentActivityProps) {
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
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Inbox className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-medium text-foreground">No recent activity</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Operations logged across leads, customers, deals, and tasks will appear here.
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const actorName =
              activity.actor_type === "ai"
                ? "AI Assistant"
                : activity.actor?.full_name || activity.actor?.email || "Team Member"

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-border/40 p-2.5 hover:bg-muted/20 transition-colors"
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full shrink-0 mt-0.5 ${
                    activity.actor_type === "ai"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activity.actor_type === "ai" ? (
                    <Bot className="h-3.5 w-3.5" />
                  ) : (
                    <User className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {actorName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 font-mono">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(activity.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-foreground font-medium leading-snug">
                    {activity.title || activity.action}
                  </p>

                  {activity.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 font-mono">
                      {activity.action}
                    </Badge>

                    {activity.linked_entity && (
                      <Link
                        href={activity.linked_entity.href}
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                      >
                        <span>{activity.linked_entity.name}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        <div className="pt-2 border-t border-border/60">
          <Link
            href="/activities"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>View complete immutable audit log</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
