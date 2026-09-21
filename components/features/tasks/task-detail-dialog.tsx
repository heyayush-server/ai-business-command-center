"use client"

import React from "react"
import Link from "next/link"
import {
  Calendar,
  User,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Circle,
  Building2,
  Briefcase,
  Contact,
  Clock,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { CreateActivityDialog } from "@/components/features/activities/create-activity-dialog"
import type { TaskWithDetails } from "@/lib/services/tasks.service"

interface TaskDetailDialogProps {
  task: TaskWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (task: TaskWithDetails) => void
  onDelete: (task: TaskWithDetails) => void
  onToggleComplete: (task: TaskWithDetails) => void
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskDetailDialogProps) {
  if (!task) return null

  const isCompleted = task.status === "done"
  const isDeleted = Boolean(task.deleted_at)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {isDeleted && (
              <span className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                Archived
              </span>
            )}
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold leading-tight text-foreground">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Created {new Date(task.created_at).toLocaleDateString()}
            {task.creator?.full_name ? ` by ${task.creator.full_name}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Description */}
          <div className="space-y-1">
            <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Description
            </h4>
            <div className="rounded-md bg-muted/40 p-3 text-foreground whitespace-pre-wrap leading-relaxed min-h-[60px] border border-border/50">
              {task.description || (
                <span className="text-muted-foreground italic">No description provided.</span>
              )}
            </div>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Due Date */}
            <div className="space-y-1 rounded-md border border-border p-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Calendar className="h-3.5 w-3.5" />
                <span>Due Date</span>
              </div>
              <div className="font-semibold text-foreground">
                {task.due_date ? (
                  new Date(task.due_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                ) : (
                  <span className="text-muted-foreground font-normal">No due date</span>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div className="space-y-1 rounded-md border border-border p-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <User className="h-3.5 w-3.5" />
                <span>Assignee</span>
              </div>
              <div className="font-semibold text-foreground truncate">
                {task.assigned_user?.full_name ||
                  task.assigned_user?.email || (
                    <span className="text-muted-foreground font-normal">Unassigned</span>
                  )}
              </div>
            </div>
          </div>

          {/* Linked Entity */}
          <div className="space-y-1.5">
            <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
              Related Entity
            </h4>
            {task.lead && (
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Contact className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-2">
                      Lead
                    </span>
                    <span className="font-semibold text-foreground">
                      {task.lead.first_name} {task.lead.last_name}
                    </span>
                    {task.lead.company && (
                      <span className="text-muted-foreground ml-1.5">
                        ({task.lead.company})
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/leads/${task.lead.id}`}
                  className="flex items-center gap-1 text-primary hover:underline text-xs shrink-0 font-medium ml-2"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {task.customer && (
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-2">
                      Customer
                    </span>
                    <span className="font-semibold text-foreground">
                      {task.customer.name}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/customers/${task.customer.id}`}
                  className="flex items-center gap-1 text-primary hover:underline text-xs shrink-0 font-medium ml-2"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {task.deal && (
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="h-4 w-4 text-primary shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-2">
                      Deal
                    </span>
                    <span className="font-semibold text-foreground">
                      {task.deal.title}
                    </span>
                  </div>
                </div>
                <Link
                  href="/deals"
                  className="flex items-center gap-1 text-primary hover:underline text-xs shrink-0 font-medium ml-2"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}

            {!task.lead && !task.customer && !task.deal && (
              <div className="p-2.5 rounded-md border border-border/40 text-muted-foreground italic">
                This task is standalone and not linked to any lead, customer, or deal.
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {new Date(task.updated_at).toLocaleString()}
            </span>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleComplete(task)}
              className="text-xs gap-1.5 flex-1 sm:flex-none"
            >
              {isCompleted ? (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Mark as To Do
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete Task
                </>
              )}
            </Button>

            <CreateActivityDialog
              defaultEntityType="task"
              defaultEntityId={task.id}
              entityName={task.title}
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Note</span>
                </Button>
              }
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onEdit(task)
              }}
              className="text-xs gap-1.5"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant={isDeleted ? "outline" : "destructive"}
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onDelete(task)
              }}
              className="text-xs gap-1.5"
            >
              {isDeleted ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Archive
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
