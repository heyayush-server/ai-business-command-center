"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Building2,
  Contact,
  Briefcase,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskPriorityBadge } from "./task-priority-badge"
import { EditTaskDialog } from "./edit-task-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { updateTaskStatusAction, assignTaskAction } from "@/lib/actions/tasks.actions"
import type { TaskWithDetails, TaskEntityOptions } from "@/lib/services/tasks.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import { TASK_STATUS_CONFIG, type TaskStatusType } from "@/lib/validations/task.schema"

interface TasksTableProps {
  tasks: TaskWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  entityOptions: TaskEntityOptions
  members: OrganizationMemberOption[]
  onCreateNew?: () => void
}

export function TasksTable({
  tasks,
  total,
  page,
  pageSize,
  totalPages,
  entityOptions,
  members,
  onCreateNew,
}: TasksTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Active dialog states
  const [detailTask, setDetailTask] = useState<TaskWithDetails | null>(null)
  const [editingTask, setEditingTask] = useState<TaskWithDetails | null>(null)
  const [deletingTask, setDeletingTask] = useState<TaskWithDetails | null>(null)

  const currentSortBy = searchParams.get("sortBy") || "created_at"
  const currentSortOrder = searchParams.get("sortOrder") || "desc"

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sortBy", field)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleToggleComplete = (task: TaskWithDetails) => {
    const newStatus: TaskStatusType = task.status === "done" ? "todo" : "done"
    startTransition(async () => {
      await updateTaskStatusAction({
        id: task.id,
        status: newStatus,
      })
      if (detailTask && detailTask.id === task.id) {
        setDetailTask({ ...detailTask, status: newStatus })
      }
    })
  }

  const handleInlineStatusChange = (taskId: string, newStatus: TaskStatusType) => {
    startTransition(async () => {
      await updateTaskStatusAction({
        id: taskId,
        status: newStatus,
      })
    })
  }

  const handleInlineAssignChange = (taskId: string, assignedTo: string | null) => {
    startTransition(async () => {
      await assignTaskAction({
        id: taskId,
        assigned_to: assignedTo,
      })
    })
  }

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === "done" || status === "cancelled") return false
    const now = new Date()
    const due = new Date(dueDate)
    return due < now
  }

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/60" />
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <span className="sr-only">Status Toggle</span>
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Task</span>
                    {renderSortIcon("title")}
                  </div>
                </th>
                <th className="px-4 py-3">Linked Entity</th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("priority")}
                  className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Priority</span>
                    {renderSortIcon("priority")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("due_date")}
                  className="px-4 py-3 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center">
                    <span>Due Date</span>
                    {renderSortIcon("due_date")}
                  </div>
                </th>
                <th className="px-4 py-3">Assignee</th>
                <th className="w-16 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Calendar className="h-8 w-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium text-foreground">No tasks found</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        No tasks match your current filter settings or none have been created yet.
                      </p>
                      {onCreateNew && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onCreateNew}
                          className="mt-2 text-xs gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create Task</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isCompleted = task.status === "done"
                  const overdue = isOverdue(task.due_date, task.status)
                  const isDeleted = Boolean(task.deleted_at)

                  return (
                    <tr
                      key={task.id}
                      className={`group transition-colors hover:bg-muted/30 ${
                        isDeleted ? "bg-muted/10 opacity-70" : ""
                      }`}
                    >
                      {/* Quick Complete Toggle */}
                      <td className="px-3 py-3 text-center align-middle">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleComplete(task)
                          }}
                          disabled={isPending}
                          title={isCompleted ? "Mark as to-do" : "Mark as completed"}
                          className={`rounded-full p-1 transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${
                            isCompleted
                              ? "text-emerald-500 hover:text-emerald-600 bg-emerald-500/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td
                        onClick={() => setDetailTask(task)}
                        className="px-4 py-3 align-middle cursor-pointer max-w-xs"
                      >
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 ${
                              isCompleted ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </span>
                          {task.description && (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {task.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Linked Entity */}
                      <td className="px-4 py-3 align-middle">
                        {task.lead && (
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <Contact className="h-3.5 w-3.5 text-primary shrink-0" />
                            <Link
                              href={`/leads/${task.lead.id}`}
                              className="text-foreground hover:text-primary hover:underline truncate font-medium"
                              title={`Lead: ${task.lead.first_name} ${task.lead.last_name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.lead.first_name} {task.lead.last_name}
                            </Link>
                          </div>
                        )}
                        {task.customer && (
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            <Link
                              href={`/customers/${task.customer.id}`}
                              className="text-foreground hover:text-primary hover:underline truncate font-medium"
                              title={`Customer: ${task.customer.name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.customer.name}
                            </Link>
                          </div>
                        )}
                        {task.deal && (
                          <div className="flex items-center gap-1.5 max-w-[180px]">
                            <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                            <Link
                              href="/deals"
                              className="text-foreground hover:text-primary hover:underline truncate font-medium"
                              title={`Deal: ${task.deal.title}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.deal.title}
                            </Link>
                          </div>
                        )}
                        {!task.lead && !task.customer && !task.deal && (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-3 align-middle">
                        <select
                          value={task.status}
                          aria-label="Change task status"
                          onChange={(e) => {
                            e.stopPropagation()
                            handleInlineStatusChange(
                              task.id,
                              e.target.value as TaskStatusType
                            )
                          }}
                          disabled={isPending || isDeleted}
                          className="h-7 rounded border border-transparent bg-transparent hover:border-input focus:border-ring text-xs px-1 py-0.5 cursor-pointer font-medium"
                        >
                          {TASK_STATUS_CONFIG.map((sc) => (
                            <option key={sc.status} value={sc.status}>
                              {sc.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Priority Badge */}
                      <td className="px-4 py-3 align-middle">
                        <TaskPriorityBadge priority={task.priority} />
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3 align-middle whitespace-nowrap">
                        {task.due_date ? (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              overdue
                                ? "text-rose-500 font-semibold"
                                : isCompleted
                                ? "text-muted-foreground"
                                : "text-foreground"
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(task.due_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            {overdue && (
                              <span
                                title="Overdue"
                                className="flex items-center text-[10px] text-rose-500 bg-rose-500/10 px-1 py-0.2 rounded"
                              >
                                <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                                Late
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="px-4 py-3 align-middle">
                        <select
                          value={task.assigned_to || ""}
                          aria-label="Assign task to member"
                          onChange={(e) => {
                            e.stopPropagation()
                            handleInlineAssignChange(
                              task.id,
                              e.target.value || null
                            )
                          }}
                          disabled={isPending || isDeleted}
                          className="h-7 max-w-[140px] truncate rounded border border-transparent bg-transparent hover:border-input focus:border-ring text-xs px-1 py-0.5 cursor-pointer text-muted-foreground hover:text-foreground"
                        >
                          <option value="">Unassigned</option>
                          {members.map((m) => (
                            <option key={m.userId} value={m.userId}>
                              {m.fullName || m.email || "Member"}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailTask(task)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View Task Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingTask(task)}
                            disabled={isDeleted}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                            title="Edit Task"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTask(task)}
                            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${
                              isDeleted
                                ? "text-primary hover:text-primary"
                                : "text-muted-foreground hover:text-destructive"
                            }`}
                            title={isDeleted ? "Restore Task" : "Archive Task"}
                          >
                            {isDeleted ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground bg-muted/20">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.min((page - 1) * pageSize + 1, total)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span> tasks
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isPending}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isPending}
                className="h-8 px-2 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        entityOptions={entityOptions}
        members={members}
        open={Boolean(editingTask)}
        onOpenChange={(open) => {
          if (!open) setEditingTask(null)
        }}
      />

      {/* Delete / Restore Task Dialog */}
      <DeleteTaskDialog
        task={deletingTask}
        open={Boolean(deletingTask)}
        onOpenChange={(open) => {
          if (!open) setDeletingTask(null)
        }}
      />

      {/* Detail Dialog */}
      <TaskDetailDialog
        task={detailTask}
        open={Boolean(detailTask)}
        onOpenChange={(open) => {
          if (!open) setDetailTask(null)
        }}
        onEdit={(task) => setEditingTask(task)}
        onDelete={(task) => setDeletingTask(task)}
        onToggleComplete={(task) => handleToggleComplete(task)}
      />
    </div>
  )
}
