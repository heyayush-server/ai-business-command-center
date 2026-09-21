import React from "react"
import { Badge } from "@/components/ui/badge"
import { Circle, Clock, CheckCircle2, XCircle } from "lucide-react"
import type { TaskStatusType } from "@/lib/validations/task.schema"

interface TaskStatusBadgeProps {
  status: TaskStatusType | string
  className?: string
  showIcon?: boolean
}

export const TASK_STATUS_META: Record<
  TaskStatusType,
  {
    label: string
    colorClass: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  todo: {
    label: "To Do",
    colorClass: "bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/15 dark:text-slate-400",
    icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    colorClass: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/15",
    icon: Clock,
  },
  done: {
    label: "Completed",
    colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/15",
    icon: XCircle,
  },
}

export function TaskStatusBadge({
  status,
  className = "",
  showIcon = true,
}: TaskStatusBadgeProps) {
  const meta = TASK_STATUS_META[status as TaskStatusType] || {
    label: status.replace("_", " "),
    colorClass: "bg-muted text-muted-foreground border-border",
    icon: Circle,
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
