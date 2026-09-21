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
import { updateDealAction } from "@/lib/actions/deals.actions"
import { updateDealSchema, DEAL_STAGES_CONFIG, type DealStageType } from "@/lib/validations/deal.schema"
import type { DealWithDetails } from "@/lib/services/deals.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface EditDealDialogProps {
  deal: DealWithDetails | null
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (deal: DealWithDetails) => void
}

interface EditDealFormProps {
  deal: DealWithDetails
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
  onCancel: () => void
  onSuccess?: (deal: DealWithDetails) => void
}

function EditDealForm({
  deal,
  customers,
  members,
  onCancel,
  onSuccess,
}: EditDealFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Initialize directly from deal props
  const [title, setTitle] = useState(deal.title || deal.name || "")
  const [customerId, setCustomerId] = useState(deal.customer_id || "")
  const [stage, setStage] = useState<DealStageType>(deal.stage as DealStageType)
  const [value, setValue] = useState<string>(String(deal.value ?? 0))
  const [currency, setCurrency] = useState(deal.currency || "USD")
  const [expectedClose, setExpectedClose] = useState(
    deal.expected_close ? deal.expected_close.substring(0, 10) : ""
  )
  const [assignedTo, setAssignedTo] = useState(deal.assigned_to || "")
  const [notes, setNotes] = useState(deal.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    const rawPayload = {
      id: deal.id,
      title,
      customer_id: customerId,
      stage,
      value: parseFloat(value) || 0,
      currency,
      expected_close: expectedClose || null,
      assigned_to: assignedTo || null,
      notes: notes || null,
    }

    const result = updateDealSchema.safeParse(rawPayload)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as string
        fieldErrors[path] = issue.message
      }
      setFormErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      const res = await updateDealAction(result.data)

      if (!res.success) {
        setError(res.error || "Failed to update deal")
        setLoading(false)
        return
      }

      onSuccess?.(res.data as DealWithDetails)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle className="text-foreground">Edit Deal</DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Update deal parameters, value estimation, close target, and team assignment.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="my-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      <div className="grid gap-3.5 py-4 text-xs">
        {/* Title */}
        <div className="space-y-1">
          <Label htmlFor="edit-deal-title" className="text-xs font-medium">
            Deal Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-deal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={formErrors.title ? "border-destructive" : ""}
            required
          />
          {formErrors.title && (
            <p className="text-[11px] text-destructive">{formErrors.title}</p>
          )}
        </div>

        {/* Customer Selector */}
        <div className="space-y-1">
          <Label htmlFor="edit-deal-customer" className="text-xs font-medium">
            Customer Account <span className="text-destructive">*</span>
          </Label>
          <select
            id="edit-deal-customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className={`w-full h-9 rounded-md border bg-card px-3 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-ring ${
              formErrors.customer_id ? "border-destructive" : "border-input"
            }`}
            required
          >
            <option value="" disabled>
              Select a customer account...
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.contact ? `(${c.contact})` : ""}
              </option>
            ))}
          </select>
          {formErrors.customer_id && (
            <p className="text-[11px] text-destructive">{formErrors.customer_id}</p>
          )}
        </div>

        {/* Stage and Value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="edit-deal-stage" className="text-xs font-medium">
              Pipeline Stage
            </Label>
            <select
              id="edit-deal-stage"
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStageType)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {DEAL_STAGES_CONFIG.map(({ stage: st, label }) => (
                <option key={st} value={st}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-deal-value" className="text-xs font-medium">
              Deal Value
            </Label>
            <div className="flex gap-1.5">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-20 h-9 rounded-md border border-input bg-card px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Currency"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
              <Input
                id="edit-deal-value"
                type="number"
                min="0"
                step="100"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="flex-1"
              />
            </div>
            {formErrors.value && (
              <p className="text-[11px] text-destructive">{formErrors.value}</p>
            )}
          </div>
        </div>

        {/* Expected Close & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="edit-deal-close" className="text-xs font-medium">
              Expected Close Date
            </Label>
            <Input
              id="edit-deal-close"
              type="date"
              value={expectedClose}
              onChange={(e) => setExpectedClose(e.target.value)}
            />
            {formErrors.expected_close && (
              <p className="text-[11px] text-destructive">
                {formErrors.expected_close}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-deal-assignee" className="text-xs font-medium">
              Assigned Team Member
            </Label>
            <select
              id="edit-deal-assignee"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-xs font-normal text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName || member.email} ({member.role})
                </option>
              ))}
            </select>
            {formErrors.assigned_to && (
              <p className="text-[11px] text-destructive">
                {formErrors.assigned_to}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="edit-deal-notes" className="text-xs font-medium">
            Deal Notes &amp; Strategy
          </Label>
          <textarea
            id="edit-deal-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-input bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {formErrors.notes && (
            <p className="text-[11px] text-destructive">{formErrors.notes}</p>
          )}
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-0 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading}
          className="text-xs gap-1.5"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditDealDialog({
  deal,
  customers,
  members,
  open,
  onOpenChange,
  onSuccess,
}: EditDealDialogProps) {
  if (!deal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <EditDealForm
          key={deal.id}
          deal={deal}
          customers={customers}
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
