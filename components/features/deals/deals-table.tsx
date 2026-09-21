"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
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
  Calendar,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DealStageBadge } from "./deal-stage-badge"
import { EditDealDialog } from "./edit-deal-dialog"
import { DeleteDealDialog } from "./delete-deal-dialog"
import { changeDealStageAction, assignDealAction } from "@/lib/actions/deals.actions"
import type { DealWithDetails } from "@/lib/services/deals.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import { DEAL_STAGES_CONFIG, type DealStageType } from "@/lib/validations/deal.schema"

interface CustomerOption {
  id: string
  name: string
  contact?: string | null
}

interface DealsTableProps {
  deals: DealWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  customers: CustomerOption[]
  members: OrganizationMemberOption[]
}

export function DealsTable({
  deals,
  total,
  page,
  pageSize,
  totalPages,
  customers,
  members,
}: DealsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Active dialog states
  const [editingDeal, setEditingDeal] = useState<DealWithDetails | null>(null)
  const [deletingDeal, setDeletingDeal] = useState<DealWithDetails | null>(null)

  const currentSortBy = searchParams.get("sortBy") || "created_at"
  const currentSortOrder = searchParams.get("sortOrder") || "desc"

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (currentSortBy === field) {
      params.set("sortOrder", currentSortOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sortBy", field)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleInlineStageChange = (dealId: string, newStage: DealStageType) => {
    startTransition(async () => {
      await changeDealStageAction({
        id: dealId,
        stage: newStage,
      })
    })
  }

  const handleInlineAssignChange = (dealId: string, assignedTo: string | null) => {
    startTransition(async () => {
      await assignDealAction({
        id: dealId,
        assigned_to: assignedTo,
      })
    })
  }

  const renderSortIcon = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1" />
    }
    return currentSortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1" />
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-muted-foreground">
            <thead className="bg-muted/40 text-foreground font-semibold border-b border-border select-none">
              <tr>
                <th
                  onClick={() => handleSort("title")}
                  className="py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Deal Title</span>
                    {renderSortIcon("title")}
                  </div>
                </th>
                <th className="py-3 px-4">Customer Account</th>
                <th
                  onClick={() => handleSort("value")}
                  className="py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Value</span>
                    {renderSortIcon("value")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("stage")}
                  className="py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Stage</span>
                    {renderSortIcon("stage")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("expected_close")}
                  className="py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center">
                    <span>Expected Close</span>
                    {renderSortIcon("expected_close")}
                  </div>
                </th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="h-8 w-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground text-sm">
                        No deals match your search criteria
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your filters or create a new deal to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => {
                  const isArchived = Boolean(deal.deleted_at)
                  const formattedValue = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: deal.currency || "USD",
                    maximumFractionDigits: 0,
                  }).format(Number(deal.value) || 0)

                  return (
                    <tr
                      key={deal.id}
                      className={`hover:bg-muted/30 transition-colors group ${
                        isArchived ? "opacity-60 bg-muted/20" : ""
                      }`}
                    >
                      {/* Deal Title */}
                      <td className="py-3 px-4 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="hover:underline hover:text-primary transition-colors font-semibold truncate max-w-[200px] sm:max-w-[260px]"
                          >
                            {deal.title}
                          </Link>
                          {isArchived && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-destructive border-destructive/30"
                            >
                              Archived
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        {deal.customer ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            <Link
                              href={`/customers/${deal.customer.id}`}
                              className="hover:underline text-foreground truncate max-w-[160px]"
                            >
                              {deal.customer.name}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 font-bold text-foreground">
                        {formattedValue}
                      </td>

                      {/* Stage */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <DealStageBadge stage={deal.stage} />
                          {!isArchived && (
                            <select
                              value={deal.stage}
                              disabled={isPending}
                              onChange={(e) =>
                                handleInlineStageChange(
                                  deal.id,
                                  e.target.value as DealStageType
                                )
                              }
                              className="h-6 text-[10px] rounded border border-input bg-card px-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              aria-label="Change stage"
                            >
                              {DEAL_STAGES_CONFIG.map(({ stage: st, label }) => (
                                <option key={st} value={st}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>

                      {/* Expected Close */}
                      <td className="py-3 px-4">
                        {deal.expected_close ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                            <span>
                              {new Date(deal.expected_close).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Assigned Member */}
                      <td className="py-3 px-4">
                        <select
                          value={deal.assigned_to || ""}
                          disabled={isPending || isArchived}
                          onChange={(e) =>
                            handleInlineAssignChange(
                              deal.id,
                              e.target.value || null
                            )
                          }
                          className="h-7 text-xs rounded-md border border-input bg-card px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[150px] truncate"
                          aria-label="Change assigned team member"
                        >
                          <option value="">Unassigned</option>
                          {members.map((m) => (
                            <option key={m.userId} value={m.userId}>
                              {m.fullName || m.email}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View Deal Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setEditingDeal(deal)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Deal"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingDeal(deal)}
                            className={`p-1.5 rounded-md hover:bg-muted transition-colors ${
                              isArchived
                                ? "text-primary hover:text-primary"
                                : "text-muted-foreground hover:text-destructive"
                            }`}
                            title={isArchived ? "Restore Deal" : "Archive Deal"}
                          >
                            {isArchived ? (
                              <RotateCcw className="h-3.5 w-3.5" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {Math.min(total, (page - 1) * pageSize + 1)}
              </strong>{" "}
              to{" "}
              <strong className="text-foreground">
                {Math.min(total, page * pageSize)}
              </strong>{" "}
              of <strong className="text-foreground">{total}</strong> deals
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isPending}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 text-xs text-foreground font-medium">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isPending}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit & Delete Dialogs */}
      <EditDealDialog
        deal={editingDeal}
        customers={customers}
        members={members}
        open={Boolean(editingDeal)}
        onOpenChange={(open) => !open && setEditingDeal(null)}
      />

      <DeleteDealDialog
        deal={deletingDeal}
        open={Boolean(deletingDeal)}
        onOpenChange={(open) => !open && setDeletingDeal(null)}
      />
    </div>
  )
}
