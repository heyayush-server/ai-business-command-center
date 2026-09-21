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
  softDeleteDealAction,
  restoreDealAction,
} from "@/lib/actions/deals.actions"
import type { DealWithDetails } from "@/lib/services/deals.service"

interface DeleteDealDialogProps {
  deal: DealWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDealDialog({
  deal,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDealDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!deal) return null

  const isDeleted = Boolean(deal.deleted_at)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = isDeleted
        ? await restoreDealAction(deal.id)
        : await softDeleteDealAction(deal.id)

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
              {isDeleted ? "Restore Deal" : "Archive Deal"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isDeleted ? (
              <>
                Are you sure you want to restore{" "}
                <strong className="text-foreground font-semibold">
                  {deal.title}
                </strong>
                ? It will be returned to the active sales pipeline.
              </>
            ) : (
              <>
                Are you sure you want to archive{" "}
                <strong className="text-foreground font-semibold">
                  {deal.title}
                </strong>
                ? This deal will be hidden from active pipeline views but can be
                restored at any time.
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
            {isDeleted ? "Restore Deal" : "Archive Deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
