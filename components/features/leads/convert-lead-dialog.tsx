"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Loader2, ArrowRight } from "lucide-react"
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
import { convertLeadToCustomerAction } from "@/lib/actions/customers.actions"
import type {
  LeadWithAssignee,
  OrganizationMemberOption,
} from "@/lib/services/leads.service"

interface ConvertLeadDialogProps {
  lead: LeadWithAssignee
  members: OrganizationMemberOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COMMON_INDUSTRIES = [
  "Technology & Software",
  "Financial Services",
  "Healthcare & Life Sciences",
  "Manufacturing",
  "Retail & E-commerce",
  "Professional Services",
  "Media & Entertainment",
  "Real Estate",
  "Other",
]

export function ConvertLeadDialog({
  lead,
  members,
  open,
  onOpenChange,
}: ConvertLeadDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultAccountName =
    lead.company?.trim() ||
    `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
    "New Customer Account"

  const [accountName, setAccountName] = useState(defaultAccountName)
  const [industry, setIndustry] = useState("")
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || "")

  const leadMetadata = (lead.metadata || {}) as Record<string, unknown>
  const alreadyConverted = Boolean(leadMetadata.converted_to_customer_id)

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (alreadyConverted) {
      setError("This lead has already been converted to a customer account.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await convertLeadToCustomerAction({
        lead_id: lead.id,
        name: accountName.trim(),
        industry: industry || null,
        assigned_to: assignedTo || null,
      })

      if (!res.success || !res.data) {
        setError(res.error || "Failed to convert lead to customer")
        setLoading(false)
        return
      }

      onOpenChange(false)
      const customer = res.data as { id: string }
      router.push(`/customers/${customer.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleConvert}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="h-5 w-5" />
              <DialogTitle>Convert Lead to Customer</DialogTitle>
            </div>
            <DialogDescription className="text-xs leading-relaxed">
              Transition this qualified prospect into an active customer account.
              Contact details will be migrated and linked to the original lead for
              full audit traceability.
            </DialogDescription>
          </DialogHeader>

          {alreadyConverted && (
            <div className="my-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
              This lead was already converted. Duplicate conversions are prevented.
            </div>
          )}

          {error && (
            <div className="my-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="grid gap-3.5 py-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="convert_name" className="text-xs font-medium">
                Customer Account Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="convert_name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Acme Corporation"
                className="h-8 text-xs"
                required
                disabled={alreadyConverted}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="convert_industry" className="text-xs font-medium">
                Industry
              </Label>
              <select
                id="convert_industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                disabled={alreadyConverted}
                className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select Industry</option>
                {COMMON_INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="convert_assigned_to" className="text-xs font-medium">
                Account Manager
              </Label>
              <select
                id="convert_assigned_to"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={alreadyConverted}
                className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName || m.email || "Member"}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-md bg-muted/40 p-3 space-y-1 text-[11px] text-muted-foreground border border-border/50">
              <p className="font-medium text-foreground">Conversion details:</p>
              <p>• Primary Contact: {lead.first_name} {lead.last_name}</p>
              <p>• Email: {lead.email || "None"}</p>
              <p>• Phone: {lead.phone || "None"}</p>
              <p>• Lead Status: Will be marked as Qualified</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
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
              type="submit"
              size="sm"
              disabled={loading || alreadyConverted}
              className="text-xs gap-1.5"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Convert Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
