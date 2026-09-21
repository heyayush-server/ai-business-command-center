import React from "react"
import { Plus, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DealCard } from "./deal-card"
import type { KanbanPipelineData } from "@/lib/services/deals.service"
import { DEAL_STAGES_CONFIG, type DealStageType } from "@/lib/validations/deal.schema"

interface DealsKanbanProps {
  pipelineData: KanbanPipelineData
  onNewDealAtStage?: (stage: DealStageType) => void
}

export function DealsKanban({
  pipelineData,
  onNewDealAtStage,
}: DealsKanbanProps) {
  const { columns, totalPipelineValue, totalCount } = pipelineData

  return (
    <div className="space-y-4">
      {/* Board Summary Metric Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card/60">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-muted-foreground">Active Deals: </span>
            <span className="font-semibold text-foreground">{totalCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pipeline Value: </span>
            <span className="font-bold text-emerald-500">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(totalPipelineValue)}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground hidden sm:block">
          Use the stage arrows or dropdown on cards to progress deals through your pipeline
        </p>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start snap-x snap-mandatory">
        {DEAL_STAGES_CONFIG.map(({ stage, label }) => {
          const column = columns[stage]
          const deals = column?.deals || []
          const count = column?.count || 0
          const totalVal = column?.totalValue || 0

          const formattedStageVal = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }).format(totalVal)

          return (
            <div
              key={stage}
              className="flex-1 min-w-[280px] max-w-[340px] flex flex-col rounded-xl border border-border bg-muted/20 snap-start"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-border/80 flex items-center justify-between bg-card/40 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      stage === "discovery"
                        ? "bg-blue-500"
                        : stage === "proposal"
                        ? "bg-amber-500"
                        : stage === "negotiation"
                        ? "bg-purple-500"
                        : stage === "closed_won"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <span className="text-xs font-bold text-foreground">
                    {label}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-foreground/90">
                    {formattedStageVal}
                  </span>
                </div>
              </div>

              {/* Quick Add Button */}
              {onNewDealAtStage && (
                <div className="px-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNewDealAtStage(stage)}
                    className="w-full text-xs h-7 border border-dashed border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Deal</span>
                  </Button>
                </div>
              )}

              {/* Column Deals List */}
              <div className="p-2 space-y-2.5 flex-1 min-h-[380px] max-h-[calc(100vh-280px)] overflow-y-auto">
                {deals.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 text-muted-foreground border border-dashed border-border/60 rounded-lg">
                    <Layers className="h-4 w-4 mb-1.5 opacity-40" />
                    <p className="text-[11px]">No deals in {label}</p>
                  </div>
                ) : (
                  deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
