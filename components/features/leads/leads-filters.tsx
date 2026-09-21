"use client"

import React, { useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"

interface LeadsFiltersProps {
  members: OrganizationMemberOption[]
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualifying", label: "Qualifying" },
  { value: "qualified", label: "Qualified" },
  { value: "lost", label: "Lost" },
]

const COMMON_SOURCES = [
  { value: "all", label: "All Sources" },
  { value: "Website", label: "Website" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Referral", label: "Referral" },
  { value: "Cold Outreach", label: "Cold Outreach" },
  { value: "Inbound Call", label: "Inbound Call" },
  { value: "Organic Search", label: "Organic Search" },
  { value: "Event", label: "Event" },
]

export function LeadsFilters({ members }: LeadsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get("search") || ""
  const currentStatus = searchParams.get("status") || "all"
  const currentSource = searchParams.get("source") || "all"
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
    // Always reset to page 1 on filter/search change
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
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentStatus !== "all" ||
    currentSource !== "all" ||
    currentAssignedTo !== "all" ||
    includeDeleted

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => {
              if (searchTerm !== currentSearch) {
                updateParam("search", searchTerm.trim() || null)
              }
            }}
            placeholder="Search leads by name, email, company..."
            className="pl-9 pr-8 h-9 text-sm bg-card border-border"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                updateParam("search", null)
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <select
              value={currentStatus}
              onChange={(e) => updateParam("status", e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source Select */}
          <div className="flex items-center gap-1.5">
            <select
              value={currentSource}
              onChange={(e) => updateParam("source", e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Filter by source"
            >
              {COMMON_SOURCES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Select */}
          <div className="flex items-center gap-1.5">
            <select
              value={currentAssignedTo}
              onChange={(e) => updateParam("assigned_to", e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Filter by assignee"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.fullName || member.email || "Member"}
                </option>
              ))}
            </select>
          </div>

          {/* Soft delete toggle */}
          <Button
            variant={includeDeleted ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              updateParam("includeDeleted", includeDeleted ? null : "true")
            }
            className="h-9 gap-1.5 text-xs font-medium"
            title="Toggle viewing soft-deleted leads"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{includeDeleted ? "Showing Deleted" : "Include Deleted"}</span>
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-9 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {isPending && (
        <div className="h-0.5 w-full bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-1/3" />
        </div>
      )}
    </div>
  )
}
