"use client"

import React, { useState } from "react"
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  softDeleteTaskAction,
  restoreTaskAction,
} from "@/lib/actions/tasks.actions"
import type { TaskWithDetails } from "@/lib/services/tasks.service"

interface DeleteTaskDialogProps {
  task: TaskWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteTaskDialog({
  task,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!task) return null

  const isDeleted = Boolean(task.deleted_at)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = isDeleted
        ? await restoreTaskAction(task.id)
        : await softDeleteTaskAction(task.id)

      if (!res.success) {
        setError(res.error || "Operation failed")
        setLoading(false)
        return
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            {isDeleted ? (
              <RotateCcw className="h-5 w-5 text-primary" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <DialogTitle className="text-foreground">
              {isDeleted ? "Restore Task" : "Archive Task"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isDeleted ? (
              <>
                Are you sure you want to restore{" "}
                <strong className="text-foreground font-semibold">
                  {task.title}
                </strong>
                ? It will be returned to the active task list.
              </>
            ) : (
              <>
                Are you sure you want to archive{" "}
                <strong className="text-foreground font-semibold">
                  {task.title}
                </strong>
                ? This task will be hidden from the active list but can be restored at any time.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDeleted ? "default" : "destructive"}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="text-xs gap-1.5"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isDeleted ? "Restore Task" : "Archive Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
