"use client"

import React, { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import { ACTIVITY_TYPES_CONFIG } from "@/lib/validations/activity.schema"

interface ActivitiesFiltersProps {
  members: OrganizationMemberOption[]
}

export function ActivitiesFilters({ members }: ActivitiesFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentAction = searchParams.get("action") || "all"
  const currentEntityType = searchParams.get("entity_type") || "all"
  const currentUserId = searchParams.get("user_id") || "all"
  const currentDateFilter = searchParams.get("date_filter") || "all"

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
    currentAction !== "all" ||
    currentEntityType !== "all" ||
    currentUserId !== "all" ||
    currentDateFilter !== "all"

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search bar & quick filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search activities by title, description, or action..."
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

          {/* Activity Type Select */}
          <select
            value={currentAction}
            aria-label="Filter by activity type"
            onChange={(e) => updateParam("action", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Activity Types</option>
            {ACTIVITY_TYPES_CONFIG.map((at) => (
              <option key={at.type} value={at.type}>
                {at.label}
              </option>
            ))}
          </select>

          {/* Entity Type Select */}
          <select
            value={currentEntityType}
            aria-label="Filter by entity type"
            onChange={(e) => updateParam("entity_type", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Entities</option>
            <option value="lead">Leads</option>
            <option value="customer">Customers</option>
            <option value="deal">Deals</option>
            <option value="task">Tasks</option>
            <option value="organization">Organization</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={currentDateFilter}
            aria-label="Filter by date"
            onChange={(e) => updateParam("date_filter", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">Past 7 Days</option>
            <option value="this_month">This Month</option>
          </select>

          {/* Actor Filter */}
          <select
            value={currentUserId}
            aria-label="Filter by actor"
            onChange={(e) => updateParam("user_id", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Actors</option>
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
      </div>
    </div>
  )
}
