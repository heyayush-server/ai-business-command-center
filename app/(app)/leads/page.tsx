import React from "react"
import { Users, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Management"
        description="Capture, qualify, and track prospective customer relationships across all acquisition channels."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
              <Upload className="h-3.5 w-3.5" />
              <span>Import CSV</span>
            </Button>
            <Button size="sm" className="gap-1 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Lead</span>
            </Button>
          </div>
        }
      />

      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="Leads Database Module"
        description="Leads CRUD, automated status workflows, and AI qualification scoring will be connected to Supabase in Phase 2."
        actionLabel="Return to Command Center"
        actionHref="/dashboard"
      />
    </div>
  )
}
