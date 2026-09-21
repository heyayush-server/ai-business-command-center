"use client"

import React, { useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { ActivitiesFilters } from "./activities-filters"
import { ActivityTimeline } from "./activity-timeline"
import { CreateActivityDialog } from "./create-activity-dialog"
import type { GetActivitiesResult } from "@/lib/services/activities.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"

interface ActivitiesClientViewProps {
  activitiesResult: GetActivitiesResult
  members: OrganizationMemberOption[]
}

export function ActivitiesClientView({
  activitiesResult,
  members,
}: ActivitiesClientViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { activities, total, page, pageSize, totalPages } = activitiesResult

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Activity Log & Audit Trail"
        description="Chronological stream of user actions, recorded interactions, calls, meetings, and system state transitions across the organization."
        action={
          <Button
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Activity</span>
          </Button>
        }
      />

      {/* Filters */}
      <ActivitiesFilters members={members} />

      {/* Timeline Stream */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <ActivityTimeline
          activities={activities}
          allowAdd={false}
          emptyTitle="No activity found"
          emptyDescription="Try adjusting your filter settings or search keywords."
        />

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border mt-6 pt-4 text-xs text-muted-foreground">
            <div>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.min((page - 1) * pageSize + 1, total)}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(page * pageSize, total)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span> activities
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isPending}
                className="h-8 px-2 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <span className="text-xs">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isPending}
                className="h-8 px-2 text-xs"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Creation Dialog */}
      <CreateActivityDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
