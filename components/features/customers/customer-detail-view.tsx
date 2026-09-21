"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  RotateCcw,
  Activity,
  DollarSign,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CustomerStatusBadge } from "./customer-status-badge"
import { EditCustomerDialog } from "./edit-customer-dialog"
import { DeleteCustomerDialog } from "./delete-customer-dialog"
import {
  updateCustomerStatusAction,
  assignCustomerAction,
} from "@/lib/actions/customers.actions"
import { DealStageBadge } from "@/components/features/deals/deal-stage-badge"
import { CreateDealDialog } from "@/components/features/deals/create-deal-dialog"
import { ActivityTimeline } from "@/components/features/activities/activity-timeline"
import type { CustomerWithDetails } from "@/lib/services/customers.service"
import type { DealWithDetails } from "@/lib/services/deals.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { ActivityWithActor } from "@/lib/services/activities.service"
import type { CustomerStatus } from "@/lib/types/database.types"

interface CustomerDetailViewProps {
  customer: CustomerWithDetails
  members: OrganizationMemberOption[]
  activities: ActivityWithActor[]
  deals?: DealWithDetails[]
}

const STATUS_OPTIONS: { status: CustomerStatus; label: string }[] = [
  { status: "active", label: "Active" },
  { status: "inactive", label: "Inactive" },
  { status: "churned", label: "Churned" },
]

export function CustomerDetailView({
  customer,
  members,
  activities,
  deals: propDeals,
}: CustomerDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isArchived = Boolean(customer.deleted_at)

  const handleStatusChange = async (newStatus: CustomerStatus) => {
    if (isArchived || newStatus === customer.status) return
    startTransition(async () => {
      await updateCustomerStatusAction({ id: customer.id, status: newStatus })
      router.refresh()
    })
  }

  const handleAssignChange = async (assignedTo: string | null) => {
    if (isArchived) return
    startTransition(async () => {
      await assignCustomerAction({ id: customer.id, assigned_to: assignedTo })
      router.refresh()
    })
  }

  const deals = propDeals || customer.deals || []
  const totalPipelineValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0)

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Customers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {customer.name}
              </h1>
              <CustomerStatusBadge status={customer.status} />
              {isArchived && (
                <Badge
                  variant="outline"
                  className="border-destructive/40 text-destructive bg-destructive/10 text-xs"
                >
                  Deleted
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Account ID: <span className="font-mono">{customer.id}</span>
            </p>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Account</span>
          </Button>
          <Button
            variant={isArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className={`h-8 gap-1.5 text-xs ${
              !isArchived ? "text-destructive hover:text-destructive" : ""
            }`}
          >
            {isArchived ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore Account</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Account Status Switcher Bar */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lifecycle Account Status
          </span>
          <div className="flex items-center gap-2">
            {STATUS_OPTIONS.map((item) => {
              const isActive = customer.status === item.status
              return (
                <button
                  key={item.status}
                  type="button"
                  disabled={isArchived || isPending}
                  onClick={() => handleStatusChange(item.status)}
                  className={`py-1.5 px-3 rounded-md text-xs font-medium border transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Main Grid: Details + Origin / Deals / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Account Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Account Name</span>
                  <p className="font-medium text-foreground">{customer.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Industry</span>
                  <p className="font-medium text-foreground">
                    {customer.industry || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Website</span>
                  <p className="font-medium text-foreground">
                    {customer.website ? (
                      <a
                        href={
                          customer.website.startsWith("http")
                            ? customer.website
                            : `https://${customer.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline hover:text-primary"
                      >
                        <span>{customer.website}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Account Manager</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <select
                      value={customer.assigned_to || ""}
                      disabled={isArchived || isPending}
                      onChange={(e) =>
                        handleAssignChange(e.target.value || null)
                      }
                      className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      aria-label="Change assigned account manager"
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

              <Separator />

              {/* Primary Contact Details */}
              <div className="space-y-3">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Primary Contact
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Contact Name</span>
                    <p className="font-medium text-foreground">
                      {customer.primary_contact_name || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Email Address</span>
                    <p className="font-medium text-foreground">
                      {customer.primary_contact_email ? (
                        <a
                          href={`mailto:${customer.primary_contact_email}`}
                          className="hover:underline hover:text-primary flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          <span>{customer.primary_contact_email}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Phone Number</span>
                    <p className="font-medium text-foreground">
                      {customer.primary_contact_phone ? (
                        <a
                          href={`tel:${customer.primary_contact_phone}`}
                          className="hover:underline hover:text-primary flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{customer.primary_contact_phone}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {new Date(customer.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Modified:{" "}
                    {new Date(customer.updated_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Deals Section */}
          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Associated Deals</span>
                <Badge variant="outline" className="text-[11px] ml-1.5">
                  {deals.length}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                {totalPipelineValue > 0 && (
                  <span className="text-xs font-semibold text-emerald-500">
                    Total: ${totalPipelineValue.toLocaleString()}
                  </span>
                )}
                <CreateDealDialog
                  customers={[{ id: customer.id, name: customer.name }]}
                  members={members}
                  defaultCustomerId={customer.id}
                />
              </div>
            </CardHeader>
            <CardContent className="text-xs">
              {deals.length === 0 ? (
                <div className="p-6 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  <Layers className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  No deals currently attached to this customer account.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {deals.map((deal) => {
                    const title = (deal as { title?: string }).title || deal.name
                    const expectedClose = (deal as { expected_close?: string | null }).expected_close
                    return (
                      <div
                        key={deal.id}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-muted/30 px-1 rounded transition-colors"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="font-medium text-foreground hover:text-primary hover:underline truncate block"
                          >
                            {title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <DealStageBadge stage={deal.stage} />
                            {expectedClose && (
                              <span>
                                Target:{" "}
                                {new Date(expectedClose).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-foreground shrink-0">
                          ${Number(deal.value).toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Lead Origin & Activity Timeline */}
        <div className="space-y-6">
          {/* Source Lead Card (if converted) */}
          {customer.converted_from_lead && (
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Converted From Lead</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p className="font-medium text-foreground">
                  {customer.converted_from_lead.first_name}{" "}
                  {customer.converted_from_lead.last_name}
                </p>
                {customer.converted_from_lead.email && (
                  <p className="text-muted-foreground">
                    {customer.converted_from_lead.email}
                  </p>
                )}
                <div className="pt-2">
                  <Link
                    href={`/leads/${customer.converted_from_lead.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>View Original Lead Record</span>
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit & Activity Timeline Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Account Audit Log</span>
                <Badge variant="outline" className="text-[11px] ml-1.5">
                  {activities.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <ActivityTimeline
                activities={activities}
                entityType="customer"
                entityId={customer.id}
                entityName={customer.name}
                emptyTitle="No activity records yet"
                emptyDescription="Customer interactions, notes, meetings, and updates will appear here."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditCustomerDialog
        customer={customer}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Delete / Restore Dialog */}
      <DeleteCustomerDialog
        customer={customer}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
