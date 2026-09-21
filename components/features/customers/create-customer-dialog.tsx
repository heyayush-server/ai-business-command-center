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
import { createCustomerAction } from "@/lib/actions/customers.actions"
import { createCustomerSchema } from "@/lib/validations/customer.schema"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { CustomerStatus } from "@/lib/types/database.types"

interface CreateCustomerDialogProps {
  members: OrganizationMemberOption[]
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

export function CreateCustomerDialog({ members }: CreateCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Form state
  const [name, setName] = useState("")
  const [industry, setIndustry] = useState("")
  const [status, setStatus] = useState<CustomerStatus>("active")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [website, setWebsite] = useState("")
  const [assignedTo, setAssignedTo] = useState("")

  const resetForm = () => {
    setName("")
    setIndustry("")
    setStatus("active")
    setContactName("")
    setEmail("")
    setPhone("")
    setWebsite("")
    setAssignedTo("")
    setError(null)
    setFormErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFormErrors({})

    const payload = {
      name,
      industry: industry || undefined,
      status,
      primary_contact_name: contactName || undefined,
      primary_contact_email: email || undefined,
      primary_contact_phone: phone || undefined,
      website: website || undefined,
      assigned_to: assignedTo || null,
    }

    const validation = createCustomerSchema.safeParse(payload)
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
      const res = await createCustomerAction(validation.data)
      if (!res.success) {
        setError(res.error || "Failed to create customer")
        setLoading(false)
        return
      }

      resetForm()
      setOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Customer</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Customer Account</DialogTitle>
            <DialogDescription>
              Create a new business customer account verified against your
              active organization.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="my-3 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          <div className="grid gap-4 py-4 text-xs">
            {/* Account Name & Industry */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="customer_name" className="text-xs font-medium">
                  Company / Account Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customer_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="h-8 text-xs"
                  required
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">
                    {formErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry" className="text-xs font-medium">
                  Industry
                </Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
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
            </div>

            {/* Primary Contact Name & Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact_name" className="text-xs font-medium">
                  Primary Contact Name
                </Label>
                <Input
                  id="contact_name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="h-8 text-xs"
                />
                {formErrors.primary_contact_name && (
                  <p className="text-[11px] text-destructive">
                    {formErrors.primary_contact_name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email" className="text-xs font-medium">
                  Primary Contact Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@acme.com"
                  className="h-8 text-xs"
                />
                {formErrors.primary_contact_email && (
                  <p className="text-[11px] text-destructive">
                    {formErrors.primary_contact_email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone & Website */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-xs font-medium">
                  Website URL
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://acme.com"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Status & Assigned Member */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs font-medium">
                  Account Status
                </Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                  className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assigned_to" className="text-xs font-medium">
                  Account Manager
                </Label>
                <select
                  id="assigned_to"
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
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
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
              <span>Create Customer</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
