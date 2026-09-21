"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  User,
  Clock,
  ExternalLink,
  Building2,
  Contact,
  Briefcase,
  CheckSquare,
  Activity,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActivityBadge, getActionMeta } from "./activity-badge"
import { CreateActivityDialog } from "./create-activity-dialog"
import type { ActivityWithDetails } from "@/lib/services/activities.service"
import type { ActivityEntityType } from "@/lib/validations/activity.schema"

interface ActivityTimelineProps {
  activities: ActivityWithDetails[]
  entityType?: ActivityEntityType
  entityId?: string
  entityName?: string
  allowAdd?: boolean
  className?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function ActivityTimeline({
  activities,
  entityType,
  entityId,
  entityName,
  allowAdd = true,
  className = "",
  emptyTitle = "No activities logged yet",
  emptyDescription = "Events, status updates, and recorded interactions will appear here in chronological order.",
}: ActivityTimelineProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [localActivities, setLocalActivities] = useState<ActivityWithDetails[]>([])

  const handleActivityAdded = (newActivity: ActivityWithDetails) => {
    setLocalActivities((prev) => [newActivity, ...prev])
  }

  const localIds = new Set(localActivities.map((a) => a.id))
  const items = [
    ...localActivities,
    ...activities.filter((a) => !localIds.has(a.id)),
  ]

  const renderLinkedEntityBadge = (act: ActivityWithDetails) => {
    if (!act.linked_entity) return null

    let Icon = Activity
    if (act.linked_entity.type === "lead") Icon = Contact
    else if (act.linked_entity.type === "customer") Icon = Building2
    else if (act.linked_entity.type === "deal") Icon = Briefcase
    else if (act.linked_entity.type === "task") Icon = CheckSquare

    return (
      <Link
        href={act.linked_entity.href}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline bg-primary/5 border border-primary/20 px-2 py-0.5 rounded transition-colors"
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate max-w-[160px]">{act.linked_entity.name}</span>
        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
      </Link>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Header / Quick Action */}
      {allowAdd && (
        <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            <span>Activity Stream</span>
            <span className="text-muted-foreground font-normal">({items.length})</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddDialogOpen(true)}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Activity</span>
          </Button>
        </div>
      )}

      {/* Timeline Stream */}
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center bg-muted/10">
          <Clock className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <h4 className="text-sm font-semibold text-foreground">{emptyTitle}</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 leading-relaxed">
            {emptyDescription}
          </p>
          {allowAdd && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
              className="mt-3 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Log First Activity</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/70">
          {items.map((act) => {
            const meta = getActionMeta(act.action)
            const IconComponent = meta.icon

            const date = new Date(act.created_at)
            const formattedDate = date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div key={act.id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-[30px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-foreground shadow-xs ring-4 ring-background ${meta.colorClass}`}
                >
                  <IconComponent className="h-3 w-3" />
                </div>

                {/* Content Box */}
                <div className="rounded-lg border border-border bg-card/60 hover:bg-card p-3 shadow-xs transition-colors space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ActivityBadge action={act.action} showIcon={false} />
                      <span className="font-semibold text-xs text-foreground">
                        {act.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  {/* Description / details if present */}
                  {act.description && (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-2 rounded border border-border/40">
                      {act.description}
                    </p>
                  )}

                  {/* Footer with Actor and Linked Entity */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3 text-muted-foreground/70" />
                      <span>
                        {act.actor?.full_name || act.actor?.email || "System"}
                      </span>
                    </div>

                    {renderLinkedEntityBadge(act)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Manual Activity Creation Modal */}
      {allowAdd && (
        <CreateActivityDialog
          defaultEntityType={entityType}
          defaultEntityId={entityId}
          entityName={entityName}
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={handleActivityAdded}
        />
      )}
    </div>
  )
}
