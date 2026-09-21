"use client"

import React, { useTransition } from "react"
import Link from "next/link"
import {
  Calendar,
  Building2,
  User,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { changeDealStageAction } from "@/lib/actions/deals.actions"
import type { DealWithDetails } from "@/lib/services/deals.service"
import type { DealStageType } from "@/lib/validations/deal.schema"

interface DealCardProps {
  deal: DealWithDetails
  onEdit?: (deal: DealWithDetails) => void
}

const STAGE_ORDER: DealStageType[] = [
  "discovery",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
]

export function DealCard({ deal }: DealCardProps) {
  const [isPending, startTransition] = useTransition()

  const currentIndex = STAGE_ORDER.indexOf(deal.stage as DealStageType)
  const prevStage = currentIndex > 0 ? STAGE_ORDER[currentIndex - 1] : null
  const nextStage =
    currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : null

  const handleStageChange = (newStage: DealStageType) => {
    startTransition(async () => {
      await changeDealStageAction({
        id: deal.id,
        stage: newStage,
      })
    })
  }

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: deal.currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(deal.value) || 0)

  const isArchived = Boolean(deal.deleted_at)

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card
      className={`p-3.5 bg-card/90 hover:bg-card border-border hover:border-primary/40 transition-all shadow-xs hover:shadow-md group relative ${
        isArchived ? "opacity-60 bg-muted/30" : ""
      }`}
    >
      {isPending && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center rounded-lg z-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Header: Title and Value */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/deals/${deal.id}`}
          className="font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight"
        >
          {deal.title}
        </Link>
        <span className="font-bold text-xs sm:text-sm text-primary shrink-0">
          {formattedValue}
        </span>
      </div>

      {/* Customer Link */}
      {deal.customer && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <Link
            href={`/customers/${deal.customer.id}`}
            className="hover:underline hover:text-foreground truncate"
          >
            {deal.customer.name}
          </Link>
        </div>
      )}

      {/* Expected Close Date */}
      {deal.expected_close && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0 text-muted-foreground/70" />
          <span>
            Closes:{" "}
            {new Date(deal.expected_close).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      )}

      {/* Footer: Assignee & Stage Actions */}
      <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
        {/* Assigned Member */}
        <div className="flex items-center gap-1.5 min-w-0">
          {deal.assigned_user ? (
            <>
              <div className="h-5 w-5 shrink-0 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                {getInitials(deal.assigned_user.full_name)}
              </div>
              <span className="text-[11px] text-muted-foreground truncate max-w-[90px]">
                {deal.assigned_user.full_name || deal.assigned_user.email}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground/60 italic">
              <User className="h-3 w-3" />
              <span>Unassigned</span>
            </div>
          )}
        </div>

        {/* Fast Stage Movers */}
        {!isArchived && (
          <div className="flex items-center gap-1">
            {prevStage && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStageChange(prevStage)}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors disabled:opacity-50"
                title={`Move back to ${prevStage.replace("_", " ")}`}
                aria-label={`Move back to ${prevStage.replace("_", " ")}`}
              >
                <ArrowLeft className="h-3 w-3" />
              </button>
            )}

            {/* Quick Stage Select */}
            <select
              value={deal.stage}
              disabled={isPending}
              onChange={(e) => handleStageChange(e.target.value as DealStageType)}
              className="h-6 text-[10px] rounded border border-input bg-card px-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Change stage"
            >
              {STAGE_ORDER.map((stage) => (
                <option key={stage} value={stage}>
                  {stage.replace("_", " ")}
                </option>
              ))}
            </select>

            {nextStage && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStageChange(nextStage)}
                className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors disabled:opacity-50"
                title={`Advance to ${nextStage.replace("_", " ")}`}
                aria-label={`Advance to ${nextStage.replace("_", " ")}`}
              >
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
