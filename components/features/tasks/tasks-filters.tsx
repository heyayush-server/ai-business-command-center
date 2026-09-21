"use client"

import React, { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/lib/validations/task.schema"

interface TasksFiltersProps {
  members: OrganizationMemberOption[]
}

export function TasksFilters({ members }: TasksFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentStatus = searchParams.get("status") || "all"
  const currentPriority = searchParams.get("priority") || "all"
  const currentAssignedTo = searchParams.get("assigned_to") || "all"
  const currentDueDateFilter = searchParams.get("due_date_filter") || "all"
  const includeDeleted = searchParams.get("includeDeleted") === "true"

  const [searchTerm, setSearchTerm] = React.useState(currentSearch)
  const [prevSearch, setPrevSearch] = React.useState(currentSearch)

  if (prevSearch !== currentSearch) {
    setPrevSearch(currentSearch)
    setSearchTerm(currentSearch)
  }

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam("search", searchTerm.trim() || null)
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    const params = new URLSearchParams()
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentStatus !== "all" ||
    currentPriority !== "all" ||
    currentAssignedTo !== "all" ||
    currentDueDateFilter !== "all" ||
    includeDeleted

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar & quick filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8.5 pr-8 text-xs h-9"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  updateParam("search", null)
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Status Select */}
          <select
            value={currentStatus}
            aria-label="Filter by task status"
            onChange={(e) => updateParam("status", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            {TASK_STATUS_CONFIG.map((sc) => (
              <option key={sc.status} value={sc.status}>
                {sc.label}
              </option>
            ))}
          </select>

          {/* Priority Select */}
          <select
            value={currentPriority}
            aria-label="Filter by task priority"
            onChange={(e) => updateParam("priority", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Priorities</option>
            {TASK_PRIORITY_CONFIG.map((pc) => (
              <option key={pc.priority} value={pc.priority}>
                {pc.label}
              </option>
            ))}
          </select>

          {/* Due Date Filter */}
          <select
            value={currentDueDateFilter}
            aria-label="Filter by task due date"
            onChange={(e) => updateParam("due_date_filter", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Due Dates</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="this_week">Due This Week</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={currentAssignedTo}
            aria-label="Filter by task assignee"
            onChange={(e) => updateParam("assigned_to", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.fullName || m.email || "Member"}
              </option>
            ))}
          </select>

          {/* Clear button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs h-9 text-muted-foreground hover:text-foreground px-2"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right side: soft delete toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={includeDeleted ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              updateParam("includeDeleted", includeDeleted ? null : "true")
            }
            className={`text-xs h-9 gap-1.5 ${
              includeDeleted ? "border-amber-500/30 text-amber-500 bg-amber-500/10" : ""
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Archived</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
