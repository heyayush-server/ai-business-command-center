"use client"

import * as React from "react"
import {
  Users,
  TrendingUp,
  ListTodo,
  Building2,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const CRM_MODULES = [
  {
    icon: <Users className="h-5 w-5 text-blue-600" />,
    title: "Leads & Qualification",
    badge: "Lifecycle Tracking",
    description:
      "Capture prospect interest, track qualification stages from 'new' to 'qualified', and seamlessly convert qualified leads into customer accounts with full history preservation.",
    stat: "42 Active Leads",
    feature: "Zero Orphaned Leads",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
    title: "Deals & Visual Pipeline",
    badge: "Kanban Velocity",
    description:
      "Manage pipeline across discovery, proposal, negotiation, closed_won, and closed_lost stages with weighted probabilities, currency values, and expected close dates.",
    stat: "$142,800 Pipeline",
    feature: "Stage-Gate Validation",
  },
  {
    icon: <ListTodo className="h-5 w-5 text-violet-600" />,
    title: "Operational Tasks & SLAs",
    badge: "Deadlines & Priority",
    description:
      "Orchestrate operational tasks with high, medium, and urgent priorities. Explicitly link tasks to leads, deals, or customers with automated overdue alerting.",
    stat: "27 Open Tasks",
    feature: "SLA Overdue Tracking",
  },
  {
    icon: <Building2 className="h-5 w-5 text-amber-600" />,
    title: "360° Customer Directory",
    badge: "Account Retention",
    description:
      "Centralized directory of corporate accounts with primary contact details, industry categorization, linked deal history, and health indicators.",
    stat: "89 Accounts",
    feature: "98.4% Retention",
  },
  {
    icon: <Activity className="h-5 w-5 text-rose-600" />,
    title: "Immutable Activity Stream",
    badge: "Audit Integrity",
    description:
      "Append-only audit trail logging every user and AI tool action. Complete visibility into what happened, who approved it, and when it executed.",
    stat: "100% Audited",
    feature: "Tamper-Proof Log",
  },
]

export function CRMIntelligenceSection() {
  return (
    <section id="crm-suite" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
            Core Business Engine
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Five Operational Levers, One Command Center
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Eliminate fragmented tools with a tightly coupled relational system where every prospect, deal, task, and account is linked.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CRM_MODULES.map((module) => (
            <Card
              key={module.title}
              className="border-border bg-card shadow-xs hover:shadow-md transition-all hover:-translate-y-1 duration-200"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    {module.icon}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {module.badge}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-foreground">{module.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{module.stat}</span>
                  <div className="flex items-center gap-1 text-primary text-[11px] font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{module.feature}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 6th Card: MCP Intelligence Integration */}
          <Card className="border-primary/30 bg-primary/5 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 duration-200 flex flex-col justify-between">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-2xs">
                  MCP
                </div>
                <Badge variant="default" className="text-[10px] font-mono">
                  Phase 13 Active
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-foreground">MCP Tool Layer Integration</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every CRM domain exposes typed, role-gated AI tools. Read queries execute instantly; write actions stage pending mutations for human sign-off.
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">12 Business Tools</span>
                <span className="text-primary text-[11px] font-medium flex items-center gap-1">
                  <span>Explore MCP</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
