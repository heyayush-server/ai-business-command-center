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
  softDeleteCustomerAction,
  restoreCustomerAction,
} from "@/lib/actions/customers.actions"
import type { CustomerWithDetails } from "@/lib/services/customers.service"

interface DeleteCustomerDialogProps {
  customer: CustomerWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!customer) return null

  const isDeleted = Boolean(customer.deleted_at)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = isDeleted
        ? await restoreCustomerAction(customer.id)
        : await softDeleteCustomerAction(customer.id)

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
              <AlertTriangle className="h-5 w-5" />
            )}
            <DialogTitle>
              {isDeleted ? "Restore Customer Account" : "Delete Customer Account"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs leading-relaxed">
            {isDeleted ? (
              <>
                Are you sure you want to restore{" "}
                <strong className="text-foreground">{customer.name}</strong>?
                This account will reappear in active customer lists, deal
                associations, and metrics.
              </>
            ) : (
              <>
                Are you sure you want to soft delete{" "}
                <strong className="text-foreground">{customer.name}</strong>?
                The account will be hidden from default active views but
                preserved in the audit history.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="my-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-end mt-3">
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
            {isDeleted ? (
              <span>Restore Customer</span>
            ) : (
              <span>Confirm Delete</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
