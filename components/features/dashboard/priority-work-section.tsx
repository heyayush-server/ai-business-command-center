import React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PriorityItem } from "@/lib/services/dashboard.service"

interface PriorityWorkSectionProps {
  items: PriorityItem[]
}

const ITEM_ICONS = {
  overdue_task: <AlertTriangle className="h-4 w-4 text-rose-600" />,
  urgent_task: <Clock className="h-4 w-4 text-amber-600" />,
  deal_closing_soon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
  deal_needs_attention: <TrendingUp className="h-4 w-4 text-purple-600" />,
}

export function PriorityWorkSection({ items }: PriorityWorkSectionProps) {
  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Priority Work &amp; Action Queue
            </CardTitle>
            <Badge
              variant={items.length > 0 ? "default" : "outline"}
              className="text-[10px] font-normal"
            >
              {items.length} {items.length === 1 ? "Item" : "Items"} Pending
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Overdue tasks, urgent operational deadlines, and deals requiring immediate action.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500/60 mb-2" />
            <p className="text-xs font-semibold text-foreground">All Clear</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              No overdue tasks, urgent items, or critical deal deadlines right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item) => {
              const icon = ITEM_ICONS[item.type] || <Clock className="h-4 w-4 text-primary" />

              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg border border-border/60 bg-muted/20 p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {icon}
                        <span className="text-xs font-semibold text-foreground truncate">
                          {item.title}
                        </span>
                      </div>
                      <Badge
                        variant={item.badgeVariant}
                        className="text-[10px] uppercase font-mono px-1.5 py-0 h-4 shrink-0"
                      >
                        {item.badgeText}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[11px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {item.dateLabel && (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>{item.dateLabel}</span>
                        </>
                      )}
                    </div>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Deterministic queue sorted by urgency and deadline</span>
          <Link
            href="/tasks?due_date_filter=overdue"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>View all overdue tasks</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
