"use client"

import React, { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateLeadAction } from "@/lib/actions/leads.actions"
import { updateLeadSchema } from "@/lib/validations/lead.schema"
import type { LeadWithAssignee, OrganizationMemberOption } from "@/lib/services/leads.service"
import type { LeadStatus } from "@/lib/types/database.types"

interface EditLeadDialogProps {
  lead: LeadWithAssignee | null
  members: OrganizationMemberOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const SOURCES = [
  "Website",
  "LinkedIn",
  "Referral",
  "Cold Outreach",
  "Inbound Call",
  "Organic Search",
  "Event",
  "Other",
]

interface EditLeadFormProps {
  lead: LeadWithAssignee
  members: OrganizationMemberOption[]
  onCancel: () => void
  onSuccess?: () => void
}

function EditLeadForm({
  lead,
  members,
  onCancel,
  onSuccess,
}: EditLeadFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form state initialized directly from lead props
  const [firstName, setFirstName] = useState(lead.first_name || "")
  const [lastName, setLastName] = useState(lead.last_name || "")
  const [email, setEmail] = useState(lead.email || "")
  const [phone, setPhone] = useState(lead.phone || "")
  const [company, setCompany] = useState(lead.company || "")
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [source, setSource] = useState(lead.source || "Website")
  const [assignedTo, setAssignedTo] = useState(lead.assigned_to || "")
  const [notes, setNotes] = useState(lead.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormErrors({})

    const payload = {
      id: lead.id,
      first_name: firstName,
      last_name: lastName,
      email: email || undefined,
      phone: phone || undefined,
      company: company || undefined,
      status,
      source: source || undefined,
      assigned_to: assignedTo || null,
      notes: notes || undefined,
    }

    const validation = updateLeadSchema.safeParse(payload)
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (path) fieldErrors[path] = err.message
      })
      setFormErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await updateLeadAction(validation.data)
      if (!res.success) {
        setError(res.error || "Failed to update lead")
        setLoading(false)
        return
      }

      onSuccess?.()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogDescription>
          Update prospect details. Changes are automatically logged to the
          lead audit history.
        </DialogDescription>
      </DialogHeader>

      {error && (
        <div className="my-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {error}
        </div>
      )}

      <div className="grid gap-4 py-4 text-xs">
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit_first_name" className="text-xs font-medium">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit_first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="h-8 text-xs"
              required
            />
            {formErrors.first_name && (
              <p className="text-[11px] text-destructive">
                {formErrors.first_name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit_last_name" className="text-xs font-medium">
              Last Name
            </Label>
            <Input
              id="edit_last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="h-8 text-xs"
            />
            {formErrors.last_name && (
              <p className="text-[11px] text-destructive">
                {formErrors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit_email" className="text-xs font-medium">
              Email
            </Label>
            <Input
              id="edit_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@company.com"
              className="h-8 text-xs"
            />
            {formErrors.email && (
              <p className="text-[11px] text-destructive">
                {formErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit_phone" className="text-xs font-medium">
              Phone
            </Label>
            <Input
              id="edit_phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="h-8 text-xs"
            />
            {formErrors.phone && (
              <p className="text-[11px] text-destructive">
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Company & Source */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit_company" className="text-xs font-medium">
              Company
            </Label>
            <Input
              id="edit_company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Corp"
              className="h-8 text-xs"
            />
            {formErrors.company && (
              <p className="text-[11px] text-destructive">
                {formErrors.company}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit_source" className="text-xs font-medium">
              Source
            </Label>
            <select
              id="edit_source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status & Assigned To */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit_status" className="text-xs font-medium">
              Status
            </Label>
            <select
              id="edit_status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualifying">Qualifying</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit_assigned_to" className="text-xs font-medium">
              Assigned Member
            </Label>
            <select
              id="edit_assigned_to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
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
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="edit_notes" className="text-xs font-medium">
            Internal Notes
          </Label>
          <Textarea
            id="edit_notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add background information, qualification criteria, or context..."
            className="text-xs min-h-[70px]"
          />
        </div>
      </div>

      <DialogFooter className="gap-2">
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
          <span>Save Changes</span>
        </Button>
      </DialogFooter>
    </form>
  )
}

export function EditLeadDialog({
  lead,
  members,
  open,
  onOpenChange,
  onSuccess,
}: EditLeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        {lead && (
          <EditLeadForm
            key={lead.id}
            lead={lead}
            members={members}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false)
              onSuccess?.()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
