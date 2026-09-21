import React from "react"
import Link from "next/link"
import { Users, ArrowUpRight, Building2, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LeadCustomerSummary } from "@/lib/services/dashboard.service"

interface LeadConversionChartProps {
  summary: LeadCustomerSummary
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-indigo-500" },
  qualifying: { label: "Qualifying", color: "bg-amber-500" },
  qualified: { label: "Qualified", color: "bg-emerald-500" },
  lost: { label: "Lost", color: "bg-rose-500" },
}

export function LeadConversionChart({ summary }: LeadConversionChartProps) {
  const {
    totalLeads,
    leadsByStatus,
    totalCustomers,
    recentCustomers,
    convertedLeadsCount,
    conversionRate,
  } = summary

  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Leads &amp; Customer Conversion
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal">
              {totalCustomers} Customers
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Lead acquisition pipeline and customer conversion metrics.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Users className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {/* Conversion Key Metric Box */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Converted Leads</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {convertedLeadsCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {totalLeads} total
              </span>
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            <span className="text-xs text-muted-foreground block">Conversion Rate</span>
            <div className="text-lg font-bold text-foreground">
              {conversionRate}%
            </div>
          </div>
        </div>

        {/* Lead Status Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Leads by Status</span>
            <span>{totalLeads} Total</span>
          </div>

          {totalLeads === 0 ? (
            <div className="py-4 text-center text-xs text-muted-foreground">
              No leads registered yet.
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(leadsByStatus).map(([status, count]) => {
                const cfg = STATUS_LABELS[status] || { label: status, color: "bg-slate-400" }
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${cfg.color}`} />
                        <span className="font-medium text-foreground">{cfg.label}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px] font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={`h-full ${cfg.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recently Created Customers */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Recently Added Customers</span>
            <Link href="/customers" className="text-primary hover:underline text-[11px]">
              View all
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <div className="py-3 text-center text-xs text-muted-foreground">
              No customers found.
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentCustomers.slice(0, 3).map((cust) => (
                <div
                  key={cust.id}
                  className="flex items-center justify-between text-xs rounded-md bg-muted/20 px-2.5 py-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Link
                      href={`/customers/${cust.id}`}
                      className="font-medium text-foreground truncate hover:underline"
                    >
                      {cust.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cust.converted_from_lead_id && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0">
                        Converted
                      </Badge>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      {cust.created_at.slice(0, 10)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Manage Leads</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <span>Manage Customers</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
