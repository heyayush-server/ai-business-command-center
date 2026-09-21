import React from "react"
import { Building2, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Accounts"
        description="Comprehensive 360-degree account directory, contracts, lifetime values, and primary contacts."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
            <Button size="sm" className="gap-1 text-xs h-8">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Customer</span>
            </Button>
          </div>
        }
      />

      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Customers Directory Module"
        description="Full customer lifecycle, enterprise account hierarchies, and contact associations will be wired in Phase 2."
        actionLabel="Return to Command Center"
        actionHref="/dashboard"
      />
    </div>
  )
}
