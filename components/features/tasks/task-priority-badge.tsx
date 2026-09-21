import React from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react"
import type { TaskPriorityType } from "@/lib/validations/task.schema"

interface TaskPriorityBadgeProps {
  priority: TaskPriorityType | string
  className?: string
  showIcon?: boolean
}

export const TASK_PRIORITY_META: Record<
  TaskPriorityType,
  {
    label: string
    colorClass: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  low: {
    label: "Low",
    colorClass: "bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400",
    icon: ArrowDown,
  },
  medium: {
    label: "Medium",
    colorClass: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: ArrowUp,
  },
  urgent: {
    label: "Urgent",
    colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse",
    icon: AlertTriangle,
  },
}

export function TaskPriorityBadge({
  priority,
  className = "",
  showIcon = true,
}: TaskPriorityBadgeProps) {
  const meta = TASK_PRIORITY_META[priority as TaskPriorityType] || {
    label: priority,
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: AlertCircle,
  }

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
