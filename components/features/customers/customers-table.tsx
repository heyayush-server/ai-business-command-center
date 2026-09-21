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
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CustomerStatusBadge } from "./customer-status-badge"
import { EditCustomerDialog } from "./edit-customer-dialog"
import { DeleteCustomerDialog } from "./delete-customer-dialog"
import {
  updateCustomerStatusAction,
  assignCustomerAction,
} from "@/lib/actions/customers.actions"
import type { CustomerWithDetails } from "@/lib/services/customers.service"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { CustomerStatus } from "@/lib/types/database.types"

interface CustomersTableProps {
  customers: CustomerWithDetails[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  members: OrganizationMemberOption[]
}

const STATUS_LIST: CustomerStatus[] = ["active", "inactive", "churned"]

export function CustomersTable({
  customers,
  total,
  page,
  pageSize,
  totalPages,
  members,
}: CustomersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Active dialog states
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerWithDetails | null>(null)
  const [deletingCustomer, setDeletingCustomer] =
    useState<CustomerWithDetails | null>(null)

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
    customerId: string,
    newStatus: CustomerStatus
  ) => {
    startTransition(async () => {
      await updateCustomerStatusAction({ id: customerId, status: newStatus })
    })
  }

  const handleQuickAssign = async (
    customerId: string,
    assignedTo: string | null
  ) => {
    startTransition(async () => {
      await assignCustomerAction({ id: customerId, assigned_to: assignedTo })
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

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          No customer accounts found
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          No records match your active query or filters. Create a customer or
          convert an existing qualified lead.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-medium text-muted-foreground">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Account Name</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th className="py-3 px-4">Industry</th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer select-none hover:text-foreground transition-colors"
                  onClick={() => handleSort("primary_contact_name")}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Primary Contact</span>
                    {renderSortIcon("primary_contact_name")}
                  </div>
                </th>
                <th className="py-3 px-4">Account Manager</th>
                <th className="py-3 px-4">Origin</th>
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
              {customers.map((customer) => {
                const isArchived = Boolean(customer.deleted_at)

                return (
                  <tr
                    key={customer.id}
                    className={`group hover:bg-muted/30 transition-colors ${
                      isArchived ? "opacity-60 bg-muted/10" : ""
                    }`}
                  >
                    {/* Account Name */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <NextLink
                            href={`/customers/${customer.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors hover:underline"
                          >
                            {customer.name}
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
                        {customer.website && (
                          <a
                            href={
                              customer.website.startsWith("http")
                                ? customer.website
                                : `https://${customer.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary truncate max-w-[180px]"
                          >
                            <span>{customer.website.replace(/^https?:\/\//, "")}</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-3 px-4">
                      <span className="text-muted-foreground">
                        {customer.industry || "—"}
                      </span>
                    </td>

                    {/* Status with Quick Switcher */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <select
                          value={customer.status}
                          disabled={isArchived}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              customer.id,
                              e.target.value as CustomerStatus
                            )
                          }
                          className="text-[11px] font-medium bg-transparent border-none cursor-pointer focus:outline-none focus:ring-0 p-0"
                          aria-label={`Change status for ${customer.name}`}
                        >
                          {STATUS_LIST.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-card text-foreground"
                            >
                              {st.charAt(0).toUpperCase() + st.slice(1)}
                            </option>
                          ))}
                        </select>
                        <CustomerStatusBadge
                          status={customer.status}
                          showDot={false}
                        />
                      </div>
                    </td>

                    {/* Primary Contact */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">
                          {customer.primary_contact_name || "—"}
                        </span>
                        {customer.primary_contact_email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {customer.primary_contact_email}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Account Manager / Assignee */}
                    <td className="py-3 px-4">
                      <select
                        value={customer.assigned_to || ""}
                        disabled={isArchived}
                        onChange={(e) =>
                          handleQuickAssign(
                            customer.id,
                            e.target.value || null
                          )
                        }
                        className="text-xs bg-transparent border border-border/50 rounded px-1.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring max-w-[140px] truncate"
                        aria-label={`Assign account manager for ${customer.name}`}
                      >
                        <option
                          value=""
                          className="bg-card text-muted-foreground"
                        >
                          Unassigned
                        </option>
                        {members.map((m) => (
                          <option
                            key={m.userId}
                            value={m.userId}
                            className="bg-card text-foreground"
                          >
                            {m.fullName || m.email || "Member"}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Converted Lead Origin */}
                    <td className="py-3 px-4">
                      {customer.converted_from_lead ? (
                        <NextLink
                          href={`/leads/${customer.converted_from_lead.id}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                          title="View original lead"
                        >
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span>Lead</span>
                        </NextLink>
                      ) : (
                        <span className="text-muted-foreground">Direct</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(customer.created_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>

                    {/* Row Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <NextLink
                          href={`/customers/${customer.id}`}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Account Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </NextLink>

                        <button
                          type="button"
                          onClick={() => setEditingCustomer(customer)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCustomer(customer)}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title={
                            isArchived ? "Restore Customer" : "Delete Customer"
                          }
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
            of <strong className="text-foreground">{total}</strong> accounts
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
      <EditCustomerDialog
        customer={editingCustomer}
        members={members}
        open={Boolean(editingCustomer)}
        onOpenChange={(open) => {
          if (!open) setEditingCustomer(null)
        }}
      />

      {/* Delete / Restore Dialog */}
      <DeleteCustomerDialog
        customer={deletingCustomer}
        open={Boolean(deletingCustomer)}
        onOpenChange={(open) => {
          if (!open) setDeletingCustomer(null)
        }}
      />
    </div>
  )
}
