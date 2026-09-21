"use client"

import React, { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { createActivityAction } from "@/lib/actions/activities.actions"
import {
  createActivitySchema,
  ACTIVITY_TYPES_CONFIG,
  type ActivityType,
  type ActivityEntityType,
} from "@/lib/validations/activity.schema"
import type { ActivityWithDetails } from "@/lib/services/activities.service"

interface CreateActivityDialogProps {
  defaultEntityType?: ActivityEntityType
  defaultEntityId?: string
  entityName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onSuccess?: (activity: ActivityWithDetails) => void
}

export function CreateActivityDialog({
  defaultEntityType = "organization",
  defaultEntityId,
  entityName,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onSuccess,
}: CreateActivityDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val)
    } else {
      setInternalOpen(val)
    }
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form state
  const [action, setAction] = useState<ActivityType>("note")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const resetForm = () => {
    setAction("note")
    setTitle("")
    setDescription("")
    setError(null)
    setFormErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormErrors({})

    const payload = {
      action,
      title,
      description: description.trim() || undefined,
      entity_type: defaultEntityType,
      entity_id: defaultEntityId || undefined,
    }

    const validation = createActivitySchema.safeParse(payload)
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
      const res = await createActivityAction(validation.data)
      if (!res.success) {
        setError(res.error || "Failed to log activity")
        return
      }

      resetForm()
      setOpen(false)
      if (onSuccess && res.data) {
        onSuccess(res.data as ActivityWithDetails)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : !isControlled ? (
        <DialogTrigger
          render={
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              <span>Log Activity</span>
            </Button>
          }
        />
      ) : null}

      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {entityName ? `Log Activity on ${entityName}` : "Log Business Activity"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Record a meeting, call, note, email, or follow-up into the organization audit trail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Activity Type Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="activity-type" className="text-xs font-semibold">
              Activity Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="activity-type"
              value={action}
              onChange={(e) => setAction(e.target.value as ActivityType)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={loading}
            >
              {ACTIVITY_TYPES_CONFIG.map((at) => (
                <option key={at.type} value={at.type}>
                  {at.label} — {at.description}
                </option>
              ))}
            </select>
            {formErrors.action && (
              <p className="text-xs text-destructive">{formErrors.action}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="activity-title" className="text-xs font-semibold">
              Title / Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="activity-title"
              placeholder="e.g., Intro discovery call with CTO"
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
            <Label htmlFor="activity-description" className="text-xs font-semibold">
              Details / Notes (Optional)
            </Label>
            <textarea
              id="activity-description"
              rows={3}
              placeholder="Key talking points, customer objections, action items, or discussion notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            />
            {formErrors.description && (
              <p className="text-xs text-destructive">{formErrors.description}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
