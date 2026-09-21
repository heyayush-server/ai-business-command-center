import React from "react"
import { Badge } from "@/components/ui/badge"
import { Sparkles, FileText, Handshake, CheckCircle2, XCircle } from "lucide-react"
import type { DealStageType } from "@/lib/validations/deal.schema"

interface DealStageBadgeProps {
  stage: DealStageType | string
  className?: string
  showIcon?: boolean
}

export const STAGE_META: Record<
  DealStageType,
  {
    label: string
    colorClass: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  discovery: {
    label: "Discovery",
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15",
    icon: Sparkles,
  },
  proposal: {
    label: "Proposal",
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/15",
    icon: FileText,
  },
  negotiation: {
    label: "Negotiation",
    colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/15",
    icon: Handshake,
  },
  closed_won: {
    label: "Closed Won",
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15",
    icon: CheckCircle2,
  },
  closed_lost: {
    label: "Closed Lost",
    colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15",
    icon: XCircle,
  },
}

export function DealStageBadge({
  stage,
  className = "",
  showIcon = true,
}: DealStageBadgeProps) {
  const meta = STAGE_META[stage as DealStageType] || {
    label: stage.replace("_", " "),
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: Sparkles,
  }

  const IconComponent = meta.icon

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 font-medium px-2 py-0.5 text-xs capitalize ${meta.colorClass} ${className}`}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>{meta.label}</span>
    </Badge>
  )
}
