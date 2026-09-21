import React from "react"
import Link from "next/link"
import {
  CheckSquare,
  Calendar,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  ListTodo,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TaskOverviewSummary } from "@/lib/services/dashboard.service"

interface TasksOverviewProps {
  overview: TaskOverviewSummary
}

export function TasksDueSoon({ overview }: TasksOverviewProps) {
  const {
    overdueCount,
    dueTodayCount,
    dueThisWeekCount,
    tasksByStatus,
    highUrgentOpenCount,
    openTasks,
    completedTasks,
  } = overview

  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Task Operations Overview
            </CardTitle>
            <Badge
              variant={overdueCount > 0 ? "destructive" : "outline"}
              className="text-[10px] font-normal"
            >
              {openTasks} Active {openTasks === 1 ? "Task" : "Tasks"}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Operational deadlines, status distribution, and urgent queue.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <CheckSquare className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {/* Quick Deadline Filter Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/tasks?due_date_filter=overdue"
            className="group rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                Overdue
              </span>
              <AlertCircle
                className={`h-3.5 w-3.5 ${
                  overdueCount > 0 ? "text-rose-600" : "text-muted-foreground/50"
                }`}
              />
            </div>
            <div
              className={`text-lg font-bold mt-1 ${
                overdueCount > 0 ? "text-rose-600" : "text-foreground"
              }`}
            >
              {overdueCount}
            </div>
          </Link>

          <Link
            href="/tasks?due_date_filter=today"
            className="group rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                Due Today
              </span>
              <Clock
                className={`h-3.5 w-3.5 ${
                  dueTodayCount > 0 ? "text-amber-600" : "text-muted-foreground/50"
                }`}
              />
            </div>
            <div
              className={`text-lg font-bold mt-1 ${
                dueTodayCount > 0 ? "text-amber-600" : "text-foreground"
              }`}
            >
              {dueTodayCount}
            </div>
          </Link>

          <Link
            href="/tasks?due_date_filter=this_week"
            className="group rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                Due 7 Days
              </span>
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-bold mt-1 text-foreground">
              {dueThisWeekCount}
            </div>
          </Link>

          <Link
            href="/tasks?priority=urgent"
            className="group rounded-lg border border-border/60 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                High / Urgent
              </span>
              <AlertCircle
                className={`h-3.5 w-3.5 ${
                  highUrgentOpenCount > 0 ? "text-rose-500" : "text-muted-foreground/50"
                }`}
              />
            </div>
            <div
              className={`text-lg font-bold mt-1 ${
                highUrgentOpenCount > 0 ? "text-rose-600" : "text-foreground"
              }`}
            >
              {highUrgentOpenCount}
            </div>
          </Link>
        </div>

        {/* Status Distribution */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Tasks by Status</span>
            <span>{completedTasks} Completed</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Link
              href="/tasks?status=todo"
              className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <ListTodo className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-foreground">To Do</span>
              </div>
              <span className="font-semibold font-mono">{tasksByStatus.todo}</span>
            </Link>

            <Link
              href="/tasks?status=in_progress"
              className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-foreground">In Progress</span>
              </div>
              <span className="font-semibold font-mono">{tasksByStatus.in_progress}</span>
            </Link>

            <Link
              href="/tasks?status=done"
              className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-foreground">Done</span>
              </div>
              <span className="font-semibold font-mono">{tasksByStatus.done}</span>
            </Link>

            <Link
              href="/tasks?status=cancelled"
              className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-foreground">Cancelled</span>
              </div>
              <span className="font-semibold font-mono">{tasksByStatus.cancelled}</span>
            </Link>
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <span>Open tasks board</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
