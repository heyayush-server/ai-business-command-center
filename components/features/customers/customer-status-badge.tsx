import React from "react"
import { Badge } from "@/components/ui/badge"
import type { CustomerStatus } from "@/lib/types/database.types"
import { cn } from "@/lib/utils"

interface CustomerStatusBadgeProps {
  status: CustomerStatus
  className?: string
  showDot?: boolean
}

export const CUSTOMER_STATUS_CONFIG: Record<
  CustomerStatus,
  {
    label: string
    colorClass: string
    dotClass: string
  }
> = {
  active: {
    label: "Active",
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
    dotClass: "bg-amber-500",
  },
  churned: {
    label: "Churned",
    colorClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20",
    dotClass: "bg-zinc-400",
  },
}

export function CustomerStatusBadge({
  status,
  className,
  showDot = true,
}: CustomerStatusBadgeProps) {
  const config = CUSTOMER_STATUS_CONFIG[status] || {
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
