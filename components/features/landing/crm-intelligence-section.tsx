"use client"

import * as React from "react"
import {
  Users,
  TrendingUp,
  ListTodo,
  Building2,
  Activity,
  FileText,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const BUSINESS_MODULES = [
  {
    id: "leads",
    icon: <Users className="h-5 w-5 text-blue-600" />,
    title: "Leads",
    badge: "Prospect Flow",
    description:
      "Capture prospect inquiries, track qualification status, and know exactly which leads need follow-up before they grow cold.",
    metric: "32 Active Prospects",
    detail: "Automatic follow-up tracking",
  },
  {
    id: "customers",
    icon: <Building2 className="h-5 w-5 text-amber-600" />,
    title: "Customers",
    badge: "Account Directory",
    description:
      "A complete directory of all client organizations with primary contacts, contract history, and linked communication records.",
    metric: "89 Accounts",
    detail: "360° relationship timeline",
  },
  {
    id: "deals",
    icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
    title: "Deals",
    badge: "Revenue Pipeline",
    description:
      "Visualize your sales pipeline across distinct stages from initial contact to won. Monitor total pipeline value at a glance.",
    metric: "$142,500 Active",
    detail: "Real-time stage velocity",
  },
  {
    id: "tasks",
    icon: <ListTodo className="h-5 w-5 text-violet-600" />,
    title: "Tasks",
    badge: "Daily Execution",
    description:
      "Prioritize operational to-dos with clear deadlines, priority levels, and assignments linked directly to clients and deals.",
    metric: "5 Due Today",
    detail: "Zero forgotten deadlines",
  },
  {
    id: "activity",
    icon: <Activity className="h-5 w-5 text-rose-600" />,
    title: "Activity",
    badge: "Audit History",
    description:
      "A chronological, transparent log of every email, call, note, and update made across your organization.",
    metric: "100% Tracked",
    detail: "Clear accountability",
  },
  {
    id: "knowledge",
    icon: <FileText className="h-5 w-5 text-primary" />,
    title: "Knowledge",
    badge: "Business Library",
    description:
      "Upload your company playbooks, refund policies, and pricing sheets so your AI assistant can answer team questions instantly.",
    metric: "Documents at Hand",
    detail: "Instant answers with citations",
  },
]

export function CRMIntelligenceSection() {
  const [selectedModule, setSelectedModule] = React.useState<string>("deals")

  return (
    <section id="product" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs font-medium gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>One Place for Your Business</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything Your Team Needs Under One Roof
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Stop switching between separate tools and searching for missing information. See your leads, customers, deals, and tasks in one place.
          </p>
        </div>

        {/* 6 Modular Business Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BUSINESS_MODULES.map((module) => {
            const isSelected = selectedModule === module.id
            return (
              <Card
                key={module.id}
                onClick={() => setSelectedModule(module.id)}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-primary/50 bg-card shadow-lg ring-1 ring-primary/30 -translate-y-1"
                    : "border-border bg-card/80 shadow-xs hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shadow-2xs">
                      {module.icon}
                    </div>
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className="text-[10px] font-mono tracking-wide uppercase"
                    >
                      {module.badge}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span>{module.title}</span>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{module.metric}</span>
                    <div className="flex items-center gap-1 text-primary text-[11px] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{module.detail}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Dynamic Integration Banner showing how the selected card fits into Command Center */}
        <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Connected Together, Not Isolated in Silos
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Every customer connects to their deals. Every deal generates tasks. Every document powers the AI assistant.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-primary hover:underline cursor-pointer">
            <span>Explore all modules</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </section>
  )
}
