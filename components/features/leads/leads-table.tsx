"use client"

import React, { useState, useTransition } from "react"
import NextLink from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Building2,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LeadStatusBadge } from "./lead-status-badge"
import { EditLeadDialog } from "./edit-lead-dialog"
import { DeleteLeadDialog } from "./delete-lead-dialog"
import {
  updateLeadStatusAction,
  assignLeadAction,
} from "@/lib/actions/leads.actions"
import type {
  LeadWithAssignee,
  OrganizationMemberOption,
} from "@/lib/services/leads.service"
import type { LeadStatus } from "@/lib/types/database.types"

interface LeadsTableProps {
  leads: LeadWithAssignee[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  members: OrganizationMemberOption[]
}

const STATUS_LIST: LeadStatus[] = [
  "new",
  "contacted",
  "qualifying",
  "qualified",
  "lost",
]

export function LeadsTable({
  leads,
  total,
  page,
  pageSize,
  totalPages,
  members,
}: LeadsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Active dialog states
  const [editingLead, setEditingLead] = useState<LeadWithAssignee | null>(null)
  const [deletingLead, setDeletingLead] = useState<LeadWithAssignee | null>(null)

  const currentSortBy = searchParams.get("sortBy") || "created_at"
  const currentSortOrder = searchParams.get("sortOrder") || "desc"

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sortBy", field)
      params.set("sortOrder", "asc")
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleQuickStatusChange = async (
    leadId: string,
    newStatus: LeadStatus
  ) => {
    startTransition(async () => {
      await updateLeadStatusAction({ id: leadId, status: newStatus })
    })
  }

  const handleQuickAssign = async (
    leadId: string,
    assignedTo: string | null
  ) => {
    startTransition(async () => {
      await assignLeadAction({ id: leadId, assigned_to: assignedTo })
    })
  }

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/60" />
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    )
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          No leads found
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          No records match your active query or filters. Adjust your search
          parameters or create a new lead to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Responsive Table Container */}
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("first_name")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Lead Name</span>
                    {renderSortIcon("first_name")}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("company")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company</span>
                    {renderSortIcon("company")}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Assigned To</th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created</span>
                    {renderSortIcon("created_at")}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.map((lead) => {
                const isArchived = Boolean(lead.deleted_at)
                const fullName =
                  `${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
                  "Unnamed Lead"

                return (
                  <tr
                    key={lead.id}
                    className={`group hover:bg-muted/30 transition-colors ${
                      isArchived ? "opacity-60 bg-muted/10" : ""
                    }`}
                  >
                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <NextLink
                            href={`/leads/${lead.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {fullName}
                          </NextLink>
                          {isArchived && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive bg-destructive/5"
                            >
                              Deleted
                            </Badge>
                          )}
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {lead.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4">
                      {lead.company ? (
                        <div className="flex items-center gap-1.5 text-foreground">
                          <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{lead.company}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Status with Quick Switcher */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <select
                          value={lead.status}
                          disabled={isArchived}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              lead.id,
                              e.target.value as LeadStatus
                            )
                          }
                          className="text-[11px] font-medium bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0 p-0"
                          aria-label={`Change status for ${fullName}`}
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st} className="bg-card text-foreground">
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </option>
                          ))}
                        </select>
                        <LeadStatusBadge status={lead.status} showDot={false} />
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-4">
                      <span className="text-muted-foreground">
                        {lead.source || "—"}
                      </span>
                    </td>

                    {/* Assigned User with Quick Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={lead.assigned_to || ""}
                        disabled={isArchived}
                        onChange={(e) =>
                          handleQuickAssign(
                            lead.id,
                            e.target.value || null
                          )
                        }
                        className="text-xs bg-transparent border border-border/50 rounded px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[140px] truncate"
                        aria-label={`Assign ${fullName}`}
                      >
                        <option value="" className="bg-card text-muted-foreground">
                          Unassigned
                        </option>
                        {members.map((m) => (
                          <option key={m.userId} value={m.userId} className="bg-card text-foreground">
                            {m.fullName || m.email || "Member"}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <NextLink
                          href={`/leads/${lead.id}`}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Lead Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </NextLink>

                        <button
                          type="button"
                          onClick={() => setEditingLead(lead)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Lead"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingLead(lead)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title={isArchived ? "Restore Lead" : "Delete Lead"}
                        >
                          {isArchived ? (
                            <RotateCcw className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 bg-muted/20 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <strong className="text-foreground">
              {total > 0 ? (page - 1) * pageSize + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong className="text-foreground">
              {Math.min(page * pageSize, total)}
            </strong>{" "}
            of <strong className="text-foreground">{total}</strong> leads
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mr-2">
              Page {page} of {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || isPending}
              className="h-7 w-7 p-0"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages || isPending}
              className="h-7 w-7 p-0"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditLeadDialog
        lead={editingLead}
        members={members}
        open={Boolean(editingLead)}
        onOpenChange={(open) => {
          if (!open) setEditingLead(null)
        }}
      />

      {/* Delete / Restore Dialog */}
      <DeleteLeadDialog
        lead={deletingLead}
        open={Boolean(deletingLead)}
        onOpenChange={(open) => {
          if (!open) setDeletingLead(null)
        }}
      />
    </div>
  )
}
