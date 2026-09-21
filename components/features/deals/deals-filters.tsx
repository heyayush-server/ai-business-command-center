"use client"

import React, { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, LayoutGrid, Table as TableIcon, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import { DEAL_STAGES_CONFIG } from "@/lib/validations/deal.schema"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface DealsFiltersProps {
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
  viewMode: "kanban" | "table"
  onViewModeChange: (mode: "kanban" | "table") => void
}

export function DealsFilters({
  customers,
  members,
  viewMode,
  onViewModeChange,
}: DealsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentStage = searchParams.get("stage") || "all"
  const currentCustomerId = searchParams.get("customer_id") || "all"
  const currentAssignedTo = searchParams.get("assigned_to") || "all"
  const includeDeleted = searchParams.get("includeDeleted") === "true"

  const [searchTerm, setSearchTerm] = React.useState(currentSearch)
  const [prevSearch, setPrevSearch] = React.useState(currentSearch)

  // Sync internal state if URL changes externally without effect cascade
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
    if (viewMode !== "kanban") {
      params.set("view", viewMode)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentStage !== "all" ||
    currentCustomerId !== "all" ||
    currentAssignedTo !== "all" ||
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
              placeholder="Search deals by title or notes..."
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

          {/* Stage Filter */}
          <select
            value={currentStage}
            onChange={(e) => updateParam("stage", e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-card px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            aria-label="Filter by stage"
          >
            <option value="all">All Stages</option>
            {DEAL_STAGES_CONFIG.map(({ stage, label }) => (
              <option key={stage} value={stage}>
                {label}
              </option>
            ))}
          </select>

          {/* Customer Filter */}
          <select
            value={currentCustomerId}
            onChange={(e) => updateParam("customer_id", e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-card px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[160px] truncate"
            aria-label="Filter by customer account"
          >
            <option value="all">All Accounts</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Assigned Member Filter */}
          <select
            value={currentAssignedTo}
            onChange={(e) => updateParam("assigned_to", e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-card px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[150px] truncate"
            aria-label="Filter by assignee"
          >
            <option value="all">All Owners</option>
            <option value="unassigned">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.fullName || member.email}
              </option>
            ))}
          </select>

          {/* Soft Deleted Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none px-1">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) =>
                updateParam("includeDeleted", e.target.checked ? "true" : null)
              }
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span>Show Archived</span>
          </label>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1 px-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* View Mode Toggle: Kanban vs Table */}
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40 self-start md:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "kanban"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Pipeline</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>
    </div>
  )
}
