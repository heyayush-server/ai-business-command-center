"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit2,
  Trash2,
  RotateCcw,
  Calendar,
  Building2,
  DollarSign,
  ExternalLink,
  History,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DealStageBadge, STAGE_META } from "./deal-stage-badge"
import { EditDealDialog } from "./edit-deal-dialog"
import { DeleteDealDialog } from "./delete-deal-dialog"
import {
  changeDealStageAction,
  assignDealAction,
} from "@/lib/actions/deals.actions"
import { ActivityTimeline } from "@/components/features/activities/activity-timeline"
import type { DealWithDetails } from "@/lib/services/deals.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { ActivityWithActor } from "@/lib/services/activities.service"
import { DEAL_STAGES_CONFIG, type DealStageType } from "@/lib/validations/deal.schema"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface DealDetailViewProps {
  deal: DealWithDetails
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
  activities: ActivityWithActor[]
}

export function DealDetailView({
  deal: initialDeal,
  customers,
  members,
  activities,
}: DealDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deal, setDeal] = useState<DealWithDetails>(initialDeal)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const isArchived = Boolean(deal.deleted_at)

  const handleStageChange = async (newStage: DealStageType) => {
    if (isArchived || newStage === deal.stage) return
    startTransition(async () => {
      const res = await changeDealStageAction({
        id: deal.id,
        stage: newStage,
      })
      if (res.success && res.data) {
        setDeal(res.data as DealWithDetails)
      }
      router.refresh()
    })
  }

  const handleAssignChange = async (assignedTo: string | null) => {
    if (isArchived) return
    startTransition(async () => {
      const res = await assignDealAction({
        id: deal.id,
        assigned_to: assignedTo,
      })
      if (res.success && res.data) {
        setDeal(res.data as DealWithDetails)
      }
      router.refresh()
    })
  }

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: deal.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(deal.value) || 0)

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/deals"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Deals"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {deal.title}
              </h1>
              <DealStageBadge stage={deal.stage} />
              {isArchived && (
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20 text-xs"
                >
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Associated with customer account{" "}
              {deal.customer ? (
                <Link
                  href={`/customers/${deal.customer.id}`}
                  className="text-foreground font-medium hover:underline hover:text-primary"
                >
                  {deal.customer.name}
                </Link>
              ) : (
                "None"
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            disabled={isPending}
            className="gap-1.5 text-xs h-8"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Deal</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            disabled={isPending}
            className={`gap-1.5 text-xs h-8 ${
              isArchived
                ? "text-primary hover:text-primary"
                : "text-muted-foreground hover:text-destructive"
            }`}
          >
            {isArchived ? (
              <>
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Archive</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Stage Stepper / Progress Bar */}
      <Card className="border-border p-4 bg-card/70">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Sales Pipeline Stage
            </span>
            <span className="text-xs text-muted-foreground">
              Click any stage to advance or move the deal
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {DEAL_STAGES_CONFIG.map(({ stage: st, label }, index) => {
              const isActive = deal.stage === st
              const meta = STAGE_META[st]

              return (
                <button
                  key={st}
                  type="button"
                  disabled={isArchived || isPending}
                  onClick={() => handleStageChange(st)}
                  className={`relative flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                    isActive
                      ? `${meta.colorClass} ring-1 ring-primary/40 font-bold shadow-xs`
                      : "bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-[10px] opacity-60 font-mono">
                    {index + 1}.
                  </span>
                  <span>{label}</span>
                  {isActive && <CheckCircle2 className="h-3.5 w-3.5 ml-1" />}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Main Grid: Details + Customer / Notes / Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Deal Overview, Customer, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Key Metrics Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>Financial &amp; Forecast Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Deal Value</span>
                  <p className="font-bold text-base text-foreground">
                    {formattedValue}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Expected Close Date</span>
                  <p className="font-medium text-foreground flex items-center gap-1.5 pt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {deal.expected_close
                      ? new Date(deal.expected_close).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Not set"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Currency</span>
                  <p className="font-medium text-foreground pt-0.5">
                    {deal.currency || "USD"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Account Manager / Owner */}
              <div className="space-y-1.5">
                <span className="text-muted-foreground">Assigned Owner</span>
                <div className="flex items-center gap-2 pt-0.5">
                  <select
                    value={deal.assigned_to || ""}
                    disabled={isArchived || isPending}
                    onChange={(e) => handleAssignChange(e.target.value || null)}
                    className="h-8 rounded-md border border-input bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-xs"
                    aria-label="Change deal owner"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.fullName || member.email} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Separator />

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {new Date(deal.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Modified:{" "}
                    {new Date(deal.updated_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked Customer Account Card */}
          <Card className="border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Customer Account</span>
              </CardTitle>
              {deal.customer && (
                <Link
                  href={`/customers/${deal.customer.id}`}
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>View Customer</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              {deal.customer ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Account Name</span>
                    <p className="font-semibold text-foreground text-sm">
                      {deal.customer.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Primary Contact</span>
                    <p className="font-medium text-foreground">
                      {deal.customer.primary_contact_name || "—"}
                    </p>
                  </div>
                  {deal.customer.primary_contact_email && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Email</span>
                      <p className="font-medium text-foreground">
                        <a
                          href={`mailto:${deal.customer.primary_contact_email}`}
                          className="text-primary hover:underline"
                        >
                          {deal.customer.primary_contact_email}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No customer account currently attached.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Notes & Strategy Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Deal Notes &amp; Strategy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              {deal.notes ? (
                <div className="p-3.5 rounded-md bg-muted/30 border border-border leading-relaxed text-foreground whitespace-pre-wrap">
                  {deal.notes}
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No notes recorded for this deal. Click &ldquo;Edit Deal&rdquo; to add notes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right col: Activity Timeline */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <span>Activity Timeline</span>
                <Badge variant="outline" className="text-[11px] ml-1.5">
                  {activities.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs">
              <ActivityTimeline
                activities={activities}
                entityType="deal"
                entityId={deal.id}
                entityName={deal.title}
                emptyTitle="No recorded events yet"
                emptyDescription="Events, notes, and interactions on this deal will appear here."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Deal Dialog */}
      <EditDealDialog
        deal={deal}
        customers={customers}
        members={members}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={(updated) => setDeal(updated)}
      />

      {/* Delete Deal Dialog */}
      <DeleteDealDialog
        deal={deal}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => {
          setDeal((prev) => ({
            ...prev,
            deleted_at: prev.deleted_at ? null : new Date().toISOString(),
          }))
          router.refresh()
        }}
      />
    </div>
  )
}
