import React from "react"
import { TrendingUp, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals &amp; Revenue Pipeline"
        description="Kanban pipeline boards, probability weighting, expected close dates, and contract values."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </Button>
            <Button size="sm" className="gap-1 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              <span>New Deal</span>
            </Button>
          </div>
        }
      />

      <EmptyState
        icon={<TrendingUp className="h-6 w-6" />}
        title="Pipeline &amp; Deal Flow"
        description="Interactive drag-and-drop Kanban pipeline boards and deal stage velocity analytics will be implemented in Phase 3."
        actionLabel="Return to Command Center"
        actionHref="/dashboard"
      />
    </div>
  )
}
