import React from "react"
import { CheckSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks &amp; Action Items"
        description="Operational task tracking explicitly tied to deals, customers, and lead relationships."
        action={
          <Button size="sm" className="gap-1 text-xs h-8">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </Button>
        }
      />

      <EmptyState
        icon={<CheckSquare className="h-6 w-6" />}
        title="Task Management Engine"
        description="Explicit nullable foreign keys (lead_id, customer_id, deal_id) and assignee workflows scheduled for Phase 3."
        actionLabel="Return to Command Center"
        actionHref="/dashboard"
      />
    </div>
  )
}
