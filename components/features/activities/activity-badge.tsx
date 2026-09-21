import React from "react"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckSquare,
  RefreshCw,
  Activity,
  PlusCircle,
  Trophy,
  CheckCircle2,
  Trash2,
  RotateCcw,
} from "lucide-react"

interface ActivityBadgeProps {
  action: string
  className?: string
  showIcon?: boolean
}

interface ActionMeta {
  label: string
  colorClass: string
  icon: React.ComponentType<{ className?: string }>
}

export function getActionMeta(action: string): ActionMeta {
  switch (action) {
    case "note":
      return {
        label: "Note",
        colorClass: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        icon: FileText,
      }
    case "call":
      return {
        label: "Call",
        colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        icon: Phone,
      }
    case "email":
      return {
        label: "Email",
        colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: Mail,
      }
    case "meeting":
      return {
        label: "Meeting",
        colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        icon: Calendar,
      }
    case "follow_up":
      return {
        label: "Follow-up",
        colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: Clock,
      }
    case "task":
    case "task_created":
      return {
        label: "Task",
        colorClass: "bg-sky-500/10 text-sky-500 border-sky-500/20",
        icon: CheckSquare,
      }
    case "status_change":
    case "task_status_changed":
    case "lead_status_changed":
    case "deal_stage_changed":
      return {
        label: "Status Changed",
        colorClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        icon: RefreshCw,
      }
    case "task_completed":
    case "deal_won":
      return {
        label: action === "deal_won" ? "Deal Won" : "Task Completed",
        colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        icon: action === "deal_won" ? Trophy : CheckCircle2,
      }
    case "lead_created":
    case "customer_created":
    case "deal_created":
      return {
        label: "Created",
        colorClass: "bg-primary/10 text-primary border-primary/20",
        icon: PlusCircle,
      }
    case "lead_deleted":
    case "customer_deleted":
    case "deal_deleted":
    case "task_deleted":
      return {
        label: "Archived",
        colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        icon: Trash2,
      }
    case "lead_restored":
    case "customer_restored":
    case "deal_restored":
    case "task_restored":
      return {
        label: "Restored",
        colorClass: "bg-teal-500/10 text-teal-500 border-teal-500/20",
        icon: RotateCcw,
      }
    default:
      return {
        label: action
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        colorClass: "bg-muted text-muted-foreground border-border",
        icon: Activity,
      }
  }
}

export function ActivityBadge({
  action,
  className = "",
  showIcon = true,
}: ActivityBadgeProps) {
  const meta = getActionMeta(action)
  const IconComponent = meta.icon

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 text-xs capitalize ${meta.colorClass} ${className}`}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>{meta.label}</span>
    </Badge>
  )
}
