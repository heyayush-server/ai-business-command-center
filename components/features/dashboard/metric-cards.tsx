import React from "react"
import Link from "next/link"
import {
  DollarSign,
  UserPlus,
  Building2,
  CheckSquare,
  TrendingUp,
  Award,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DashboardKPIs } from "@/lib/services/dashboard.service"

interface MetricCardsProps {
  kpis: DashboardKPIs
}

export function MetricCards({ kpis }: MetricCardsProps) {
  const cards = [
    {
      label: "Total Leads",
      value: kpis.totalLeads.toLocaleString(),
      subtext: `+${kpis.recentLeadsCount} created in last 30d`,
      icon: <UserPlus className="h-4 w-4 text-blue-600" />,
      href: "/leads",
    },
    {
      label: "Total Customers",
      value: kpis.totalCustomers.toLocaleString(),
      subtext: `+${kpis.recentCustomersCount} created in last 30d`,
      icon: <Building2 className="h-4 w-4 text-emerald-600" />,
      href: "/customers",
    },
    {
      label: "Open Deals",
      value: kpis.openDealsCount.toLocaleString(),
      subtext: `$${kpis.openDealsValue.toLocaleString()} active value`,
      icon: <TrendingUp className="h-4 w-4 text-indigo-600" />,
      href: "/deals",
    },
    {
      label: "Open Tasks",
      value: kpis.openTasksCount.toLocaleString(),
      subtext:
        kpis.tasksDueSoonCount > 0
          ? `${kpis.tasksDueSoonCount} due soon or overdue`
          : "All deadlines on track",
      icon: <CheckSquare className="h-4 w-4 text-amber-600" />,
      href: "/tasks",
    },
    {
      label: "Won Deals",
      value: kpis.wonDealsCount.toLocaleString(),
      subtext: `$${kpis.wonDealsValue.toLocaleString()} won (${kpis.recentWonDealsCount} in last 30d)`,
      icon: <Award className="h-4 w-4 text-emerald-600" />,
      href: "/deals",
    },
    {
      label: "Total Pipeline Value",
      value: `$${kpis.totalPipelineValue.toLocaleString()}`,
      subtext: `Across ${kpis.openDealsCount} open ${
        kpis.openDealsCount === 1 ? "deal" : "deals"
      }`,
      icon: <DollarSign className="h-4 w-4 text-primary" />,
      href: "/deals",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="group block focus:outline-hidden">
          <Card className="border-border bg-card shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs h-full">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {card.label}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60">
                  {card.icon}
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {card.value}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground truncate">
                  {card.subtext}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
