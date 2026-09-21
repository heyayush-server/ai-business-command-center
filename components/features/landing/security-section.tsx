"use client"

import * as React from "react"
import {
  ShieldCheck,
  Lock,
  EyeOff,
  FileCheck2,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

const SECURITY_PILLARS = [
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Complete Workspace Privacy",
    description:
      "Your customer records, deal values, and team notes are strictly separated and private to your organization. No other company can ever see your data.",
    highlight: "Strict Organization Isolation",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "You Stay in Full Control",
    description:
      "AI suggestions cannot change your data on their own. Every follow-up, task creation, or deal update requires your explicit one-click approval.",
    highlight: "Human Approval Required",
  },
  {
    icon: <FileCheck2 className="h-5 w-5" />,
    title: "Transparent Audit Trail",
    description:
      "Every single action taken by team members or approved by supervisors is permanently recorded in your organization's activity log.",
    highlight: "Complete Accountability",
  },
  {
    icon: <EyeOff className="h-5 w-5" />,
    title: "Zero AI Model Training",
    description:
      "Your uploaded company documents, sales playbooks, and customer communications are never used to train public artificial intelligence models.",
    highlight: "Proprietary Data Protection",
  },
]

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Trust &amp; Privacy</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Private. Secure. Built for Your Business.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Your business operations require uncompromising trust. We ensure your information is strictly private, auditable, and always under your command.
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SECURITY_PILLARS.map((pillar, idx) => (
            <div
              key={`pillar-${idx}`}
              className="rounded-2xl border border-border bg-card p-6 space-y-3.5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {pillar.icon}
              </div>
              <h3 className="text-base font-bold text-foreground">{pillar.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
              <div className="pt-2 border-t border-border/60 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{pillar.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
