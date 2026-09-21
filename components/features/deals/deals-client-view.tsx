"use client"

import React, { useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { DealsFilters } from "./deals-filters"
import { DealsKanban } from "./deals-kanban"
import { DealsTable } from "./deals-table"
import { CreateDealDialog } from "./create-deal-dialog"
import type {
  KanbanPipelineData,
  GetDealsResult,
} from "@/lib/services/deals.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { DealStageType } from "@/lib/validations/deal.schema"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface DealsClientViewProps {
  pipelineData: KanbanPipelineData
  dealsResult: GetDealsResult
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
}

export function DealsClientView({
  pipelineData,
  dealsResult,
  customers,
  members,
}: DealsClientViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const urlView = searchParams.get("view")
  const [viewMode, setViewMode] = useState<"kanban" | "table">(
    urlView === "table" ? "table" : "kanban"
  )

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDefaultStage, setCreateDefaultStage] =
    useState<DealStageType>("discovery")

  const handleViewModeChange = (mode: "kanban" | "table") => {
    setViewMode(mode)
    const params = new URLSearchParams(searchParams.toString())
    if (mode === "table") {
      params.set("view", "table")
    } else {
      params.delete("view")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleNewDealAtStage = (stage: DealStageType) => {
    setCreateDefaultStage(stage)
    setCreateDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Sales Pipeline &amp; Deals"
        description="Track opportunities, stage velocity, expected close dates, and contract value across accounts."
        action={
          <Button
            size="sm"
            onClick={() => {
              setCreateDefaultStage("discovery")
              setCreateDialogOpen(true)
            }}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Deal</span>
          </Button>
        }
      />

      {/* Filters Bar & View Switcher */}
      <DealsFilters
        customers={customers}
        members={members}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main View: Kanban vs Table */}
      {viewMode === "kanban" ? (
        <DealsKanban
          pipelineData={pipelineData}
          onNewDealAtStage={handleNewDealAtStage}
        />
      ) : (
        <DealsTable
          deals={dealsResult.deals}
          total={dealsResult.total}
          page={dealsResult.page}
          pageSize={dealsResult.pageSize}
          totalPages={dealsResult.totalPages}
          customers={customers}
          members={members}
        />
      )}

      {/* Create Deal Dialog */}
      <CreateDealDialog
        customers={customers}
        members={members}
        defaultStage={createDefaultStage}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
