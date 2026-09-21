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
  FileText,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LeadStatusBadge } from "./lead-status-badge"
import { EditLeadDialog } from "./edit-lead-dialog"
import { DeleteLeadDialog } from "./delete-lead-dialog"
import {
  updateLeadStatusAction,
  assignLeadAction,
} from "@/lib/actions/leads.actions"
import type {
  LeadWithAssignee,
  OrganizationMemberOption,
} from "@/lib/services/leads.service"
import type { ActivityWithActor } from "@/lib/services/activities.service"
import type { LeadStatus } from "@/lib/types/database.types"

interface LeadDetailViewProps {
  lead: LeadWithAssignee
  members: OrganizationMemberOption[]
  activities: ActivityWithActor[]
}

const STATUS_PIPELINE: { status: LeadStatus; label: string }[] = [
  { status: "new", label: "New" },
  { status: "contacted", label: "Contacted" },
  { status: "qualifying", label: "Qualifying" },
  { status: "qualified", label: "Qualified" },
  { status: "lost", label: "Lost" },
]

export function LeadDetailView({
  lead,
  members,
  activities,
}: LeadDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isArchived = Boolean(lead.deleted_at)
  const fullName =
    `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "Unnamed Lead"

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (isArchived || newStatus === lead.status) return
    startTransition(async () => {
      await updateLeadStatusAction({ id: lead.id, status: newStatus })
      router.refresh()
    })
  }

  const handleAssignChange = async (assignedTo: string | null) => {
    if (isArchived) return
    startTransition(async () => {
      await assignLeadAction({ id: lead.id, assigned_to: assignedTo })
      router.refresh()
    })
  }

  const formatActivityTitle = (activity: ActivityWithActor) => {
    const actorName =
      activity.actor?.full_name || activity.actor?.email || "Team member"
    const details = (activity.details || {}) as Record<string, unknown>

    switch (activity.action) {
      case "lead.created":
        return `${actorName} captured this lead`
      case "lead.status_changed":
        return `${actorName} changed status to "${details.new_status}"`
      case "lead.assigned":
        return `${actorName} updated the assigned owner`
      case "lead.updated":
        return `${actorName} updated lead information`
      case "lead.deleted":
        return `${actorName} soft deleted this lead`
      case "lead.restored":
        return `${actorName} restored this lead`
      default:
        return `${actorName} performed ${activity.action}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Leads"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {fullName}
              </h1>
              <LeadStatusBadge status={lead.status} />
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
              Lead ID: <span className="font-mono">{lead.id}</span>
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
            <span>Edit Lead</span>
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
                <span>Restore Lead</span>
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

      {/* Status Pipeline Tracker */}
      <Card className="p-4 bg-card border-border">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Lead Qualification Pipeline
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
            {STATUS_PIPELINE.map((item) => {
              const isActive = lead.status === item.status
              return (
                <button
                  key={item.status}
                  type="button"
                  disabled={isArchived || isPending}
                  onClick={() => handleStatusChange(item.status)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium border transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Main Grid: Details + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Contact & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Prospect Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Full Name</span>
                  <p className="font-medium text-foreground">{fullName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Company</span>
                  <p className="font-medium text-foreground">
                    {lead.company || "—"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Email Address</span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    {lead.email ? (
                      <>
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`mailto:${lead.email}`}
                          className="hover:underline hover:text-primary"
                        >
                          {lead.email}
                        </a>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Phone Number</span>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    {lead.phone ? (
                      <>
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={`tel:${lead.phone}`}
                          className="hover:underline hover:text-primary"
                        >
                          {lead.phone}
                        </a>
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Acquisition Source</span>
                  <p className="font-medium text-foreground">
                    {lead.source || "Direct / Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Assigned Owner</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <select
                      value={lead.assigned_to || ""}
                      disabled={isArchived || isPending}
                      onChange={(e) =>
                        handleAssignChange(e.target.value || null)
                      }
                      className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      aria-label="Change assigned lead owner"
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

              {/* Metadata dates */}
              <div className="grid grid-cols-2 gap-4 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {new Date(lead.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Last Modified:{" "}
                    {new Date(lead.updated_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes Card */}
          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Internal Notes & Context</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Edit Notes
              </Button>
            </CardHeader>
            <CardContent className="text-xs">
              {lead.notes ? (
                <div className="p-3 rounded-md bg-muted/40 text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {lead.notes}
                </div>
              ) : (
                <div className="p-6 rounded-md border border-dashed border-border text-center text-muted-foreground">
                  No notes recorded for this lead. Click &ldquo;Edit Notes&rdquo; to add qualification details.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Activity & Audit Timeline */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Audit & Activity Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {activities.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">
                  No activity records logged yet.
                </p>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {activities.map((act) => {
                    const details = (act.details || {}) as Record<string, unknown>
                    return (
                      <div key={act.id} className="relative group">
                        {/* Timeline bullet */}
                        <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                        <div className="flex flex-col gap-0.5">
                          <p className="font-medium text-foreground text-xs leading-snug">
                            {formatActivityTitle(act)}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(act.created_at).toLocaleString(undefined, {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                          {details.previous_status && details.new_status ? (
                            <div className="mt-1 text-[11px] text-muted-foreground bg-muted/40 p-1.5 rounded">
                              Status: <span className="font-semibold text-foreground">{String(details.previous_status)}</span> → <span className="font-semibold text-primary">{String(details.new_status)}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditLeadDialog
        lead={lead}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => router.refresh()}
      />

      {/* Delete / Restore Dialog */}
      <DeleteLeadDialog
        lead={lead}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
