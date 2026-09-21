import React from "react"
import { CheckSquare, Calendar, ArrowRight, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_DUE_TASKS } from "@/lib/mock/dashboard-data"

const PRIORITY_BADGES = {
  high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
}

export function TasksDueSoon() {
  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Tasks Due Soon
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              {MOCK_DUE_TASKS.length} Urgent Items
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Operational deadlines assigned across active deals and accounts.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <CheckSquare className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {MOCK_DUE_TASKS.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted/20 transition-colors"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border ${PRIORITY_BADGES[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-xs font-semibold text-foreground truncate">
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="truncate">
                  Linked to <span className="font-medium text-foreground">{task.relatedEntity}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 shrink-0 font-medium">
                  <User className="h-3 w-3" />
                  {task.assignedTo}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium bg-muted/40 px-2 py-1 rounded">
              <Calendar className="h-3 w-3 text-primary" />
              <span>{task.dueDate}</span>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-border/60">
          <a
            href="/tasks"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>Open tasks board</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
