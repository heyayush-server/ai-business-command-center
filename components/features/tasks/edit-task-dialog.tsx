"use client"

import React, { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateTaskAction } from "@/lib/actions/tasks.actions"
import {
  updateTaskSchema,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  type TaskStatusType,
  type TaskPriorityType,
} from "@/lib/validations/task.schema"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { TaskWithDetails, TaskEntityOptions } from "@/lib/services/tasks.service"

interface EditTaskDialogProps {
  task: TaskWithDetails | null
  entityOptions: TaskEntityOptions
  members: OrganizationMemberOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (updated: TaskWithDetails) => void
}

interface EditTaskFormProps {
  task: TaskWithDetails
  entityOptions: TaskEntityOptions
  members: OrganizationMemberOption[]
  onCancel: () => void
  onSuccess?: (updated: TaskWithDetails) => void
}

function EditTaskForm({
  task,
  entityOptions,
  members,
  onCancel,
  onSuccess,
}: EditTaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form state initialized from task props
  const [title, setTitle] = useState(task.title || "")
  const [description, setDescription] = useState(task.description || "")
  const [status, setStatus] = useState<TaskStatusType>(task.status as TaskStatusType)
  const [priority, setPriority] = useState<TaskPriorityType>(task.priority as TaskPriorityType)
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : "")
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "")

  const initialEntityType = task.deal_id
    ? "deal"
    : task.customer_id
    ? "customer"
    : task.lead_id
    ? "lead"
    : "none"
  const [entityType, setEntityType] = useState<"none" | "lead" | "customer" | "deal">(
    initialEntityType
  )
  const [leadId, setLeadId] = useState(task.lead_id || "")
  const [customerId, setCustomerId] = useState(task.customer_id || "")
  const [dealId, setDealId] = useState(task.deal_id || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormErrors({})

    const payload = {
      id: task.id,
      title,
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      assigned_to: assignedTo || null,
      lead_id: entityType === "lead" && leadId ? leadId : null,
      customer_id: entityType === "customer" && customerId ? customerId : null,
      deal_id: entityType === "deal" && dealId ? dealId : null,
    }

    const validation = updateTaskSchema.safeParse(payload)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message
        }
      })
      setFormErrors(fieldErrors)
      return
    }

    setLoading(true)

    try {
      const res = await updateTaskAction(validation.data)
      if (!res.success) {
        setError(res.error || "Failed to update task")
        return
      }

      if (onSuccess && res.data) {
        onSuccess(res.data as TaskWithDetails)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-task-title" className="text-xs font-semibold">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-9 text-sm"
          disabled={loading}
          required
        />
        {formErrors.title && (
          <p className="text-xs text-destructive">{formErrors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="edit-task-description" className="text-xs font-semibold">
          Description
        </Label>
        <textarea
          id="edit-task-description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        />
        {formErrors.description && (
          <p className="text-xs text-destructive">{formErrors.description}</p>
        )}
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-status" className="text-xs font-semibold">
            Status
          </Label>
          <select
            id="edit-task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatusType)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading}
          >
            {TASK_STATUS_CONFIG.map((sc) => (
              <option key={sc.status} value={sc.status}>
                {sc.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-task-priority" className="text-xs font-semibold">
            Priority
          </Label>
          <select
            id="edit-task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriorityType)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading}
          >
            {TASK_PRIORITY_CONFIG.map((pc) => (
              <option key={pc.priority} value={pc.priority}>
                {pc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date & Assignee */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-task-due-date" className="text-xs font-semibold">
            Due Date
          </Label>
          <Input
            id="edit-task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-9 text-sm"
            disabled={loading}
          />
          {formErrors.due_date && (
            <p className="text-xs text-destructive">{formErrors.due_date}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-task-assigned-to" className="text-xs font-semibold">
            Assignee
          </Label>
          <select
            id="edit-task-assigned-to"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            disabled={loading}
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.fullName || member.email || "Member"} ({member.role})
              </option>
            ))}
          </select>
          {formErrors.assigned_to && (
            <p className="text-xs text-destructive">{formErrors.assigned_to}</p>
          )}
        </div>
      </div>

      {/* Linked Entity Section */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Relate Task To</Label>
          <div className="flex gap-2">
            {(
              [
                { id: "none", label: "None" },
                { id: "lead", label: "Lead" },
                { id: "customer", label: "Customer" },
                { id: "deal", label: "Deal" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEntityType(opt.id)}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  entityType === opt.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:bg-accent border-input"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {entityType === "lead" && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="edit-task-lead" className="text-xs font-medium">
              Select Lead
            </Label>
            <select
              id="edit-task-lead"
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={loading}
            >
              <option value="">-- Choose Lead --</option>
              {entityOptions.leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.company ? `(${l.company})` : ""}
                </option>
              ))}
            </select>
            {formErrors.lead_id && (
              <p className="text-xs text-destructive">{formErrors.lead_id}</p>
            )}
          </div>
        )}

        {entityType === "customer" && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="edit-task-customer" className="text-xs font-medium">
              Select Customer
            </Label>
            <select
              id="edit-task-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={loading}
            >
              <option value="">-- Choose Customer --</option>
              {entityOptions.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.customer_id && (
              <p className="text-xs text-destructive">{formErrors.customer_id}</p>
            )}
          </div>
        )}

        {entityType === "deal" && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="edit-task-deal" className="text-xs font-medium">
              Select Deal
            </Label>
            <select
              id="edit-task-deal"
              value={dealId}
              onChange={(e) => setDealId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={loading}
            >
              <option value="">-- Choose Deal --</option>
              {entityOptions.deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} {d.customer_name ? `(${d.customer_name})` : ""}
                </option>
              ))}
            </select>
            {formErrors.deal_id && (
              <p className="text-xs text-destructive">{formErrors.deal_id}</p>
            )}
          </div>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditTaskDialog({
  task,
  entityOptions,
  members,
  open,
  onOpenChange,
  onSuccess,
}: EditTaskDialogProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update task details, assignment, status, and related entity links.
          </DialogDescription>
        </DialogHeader>

        <EditTaskForm
          key={task.id}
          task={task}
          entityOptions={entityOptions}
          members={members}
          onCancel={() => onOpenChange(false)}
          onSuccess={(updated) => {
            onOpenChange(false)
            onSuccess?.(updated)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
