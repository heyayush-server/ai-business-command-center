import React from "react"
import { Activity, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit &amp; Activity Log"
        description="Immutable record of user operations, state changes, and AI tool calls across the organization."
        action={
          <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Event Types</span>
          </Button>
        }
      />

      <EmptyState
        icon={<Activity className="h-6 w-6" />}
        title="Enterprise Audit Stream"
        description="Polymorphic audit tracking with full actor context (user vs AI) will be active upon database connection in Phase 2."
        actionLabel="Return to Command Center"
        actionHref="/dashboard"
      />
    </div>
  )
}
