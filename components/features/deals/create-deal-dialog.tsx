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
import { createDealAction } from "@/lib/actions/deals.actions"
import { createDealSchema, DEAL_STAGES_CONFIG, type DealStageType } from "@/lib/validations/deal.schema"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { DealWithDetails } from "@/lib/services/deals.service"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface CreateDealDialogProps {
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
  defaultStage?: DealStageType
  defaultCustomerId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  onSuccess?: (deal: DealWithDetails) => void
}

export function CreateDealDialog({
  customers,
  members,
  defaultStage = "discovery",
  defaultCustomerId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  onSuccess,
}: CreateDealDialogProps) {
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
  const [title, setTitle] = useState("")
  const [customerId, setCustomerId] = useState(defaultCustomerId || "")
  const [stage, setStage] = useState<DealStageType>(defaultStage)
  const [value, setValue] = useState<string>("0")
  const [currency, setCurrency] = useState("USD")
  const [expectedClose, setExpectedClose] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [notes, setNotes] = useState("")

  const resetForm = () => {
    setTitle("")
    setCustomerId(defaultCustomerId || "")
    setStage(defaultStage)
    setValue("0")
    setCurrency("USD")
    setExpectedClose("")
    setAssignedTo("")
    setNotes("")
    setError(null)
    setFormErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setFormErrors({})

    const rawPayload = {
      title,
      customer_id: customerId,
      stage,
      value: parseFloat(value) || 0,
      currency,
      expected_close: expectedClose || null,
      assigned_to: assignedTo || null,
      notes: notes || null,
    }

    const result = createDealSchema.safeParse(rawPayload)
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
      const res = await createDealAction(result.data)

      if (!res.success) {
        setError(res.error || "Failed to create deal")
        setLoading(false)
        return
      }

      resetForm()
      setOpen(false)
      if (res.data) {
        onSuccess?.(res.data as DealWithDetails)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
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
              <span>New Deal</span>
            </Button>
          }
        />
      ) : null}

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New Deal</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new business opportunity to your revenue pipeline linked to a customer account.
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
              <Label htmlFor="deal-title" className="text-xs font-medium">
                Deal Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="deal-title"
                placeholder="e.g. Enterprise Cloud Migration Contract"
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
              <Label htmlFor="deal-customer" className="text-xs font-medium">
                Customer Account <span className="text-destructive">*</span>
              </Label>
              <select
                id="deal-customer"
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

            {/* Stage and Value row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="deal-stage" className="text-xs font-medium">
                  Pipeline Stage
                </Label>
                <select
                  id="deal-stage"
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
                <Label htmlFor="deal-value" className="text-xs font-medium">
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
                    id="deal-value"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="25000"
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

            {/* Expected Close & Assignee row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="deal-close" className="text-xs font-medium">
                  Expected Close Date
                </Label>
                <Input
                  id="deal-close"
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
                <Label htmlFor="deal-assignee" className="text-xs font-medium">
                  Assigned Team Member
                </Label>
                <select
                  id="deal-assignee"
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
              <Label htmlFor="deal-notes" className="text-xs font-medium">
                Deal Notes &amp; Strategy
              </Label>
              <textarea
                id="deal-notes"
                rows={3}
                placeholder="Scope details, decision makers, key milestones, or contract requirements..."
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
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
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
              Create Deal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
