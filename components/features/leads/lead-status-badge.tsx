import React from "react"
import { Badge } from "@/components/ui/badge"
import type { LeadStatus } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
  showDot?: boolean
}

export const STATUS_CONFIG: Record<
  LeadStatus,
  {
    label: string
    colorClass: string
    dotClass: string
  }
> = {
  new: {
    label: "New",
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
    dotClass: "bg-blue-500",
  },
  contacted: {
    label: "Contacted",
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
    dotClass: "bg-amber-500",
  },
  qualifying: {
    label: "Qualifying",
    colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
    dotClass: "bg-purple-500",
  },
  qualified: {
    label: "Qualified",
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  lost: {
    label: "Lost",
    colorClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20",
    dotClass: "bg-zinc-400",
  },
}

export function LeadStatusBadge({
  status,
  className,
  showDot = true,
}: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    colorClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide transition-colors",
        config.colorClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </Badge>
  )
}
