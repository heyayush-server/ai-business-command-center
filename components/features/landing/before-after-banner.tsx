"use client"

import * as React from "react"
import {
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Clock,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Bot,
  ShieldCheck,
  TrendingUp,
  Layers,
} from "lucide-react"

const BEFORE_ITEMS = [
  { icon: XCircle, text: "Too many open tabs" },
  { icon: AlertTriangle, text: "Missed follow-ups with hot leads" },
  { icon: FileSpreadsheet, text: "Scattered information in spreadsheets" },
  { icon: Clock, text: "Forgotten tasks and deadlines" },
  { icon: HelpCircle, text: "No clear daily priorities" },
  { icon: FileSpreadsheet, text: "Manual copy-pasting for reports" },
  { icon: Clock, text: "Important documents buried in drive folders" },
]

const AFTER_ITEMS = [
  { icon: Layers, text: "One central Command Center" },
  { icon: CheckCircle2, text: "Clear daily priorities surfaced automatically" },
  { icon: Bot, text: "AI assistant that knows your business" },
  { icon: TrendingUp, text: "Real-time deal pipeline visibility" },
  { icon: Sparkles, text: "Proactive recommendations before problems happen" },
  { icon: ShieldCheck, text: "Human approval before anything changes" },
  { icon: CheckCircle2, text: "All documents and notes at your fingertips" },
]

export function BeforeAfterBanner() {
  return (
    <section className="py-12 border-y border-border/80 bg-muted/20 overflow-hidden select-none">
      <div className="space-y-4">
        {/* Row 1: BEFORE */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 px-4 py-1 ml-4 sm:ml-8 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs font-mono font-semibold tracking-wider uppercase">
            Before
          </div>
          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee py-1 gap-4">
              {/* Duplicate array for seamless infinite marquee loop */}
              {[...BEFORE_ITEMS, ...BEFORE_ITEMS].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={`before-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-background/80 px-4 py-1.5 text-xs text-muted-foreground shadow-2xs whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Row 2: AFTER */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 px-4 py-1 ml-4 sm:ml-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold tracking-wider uppercase">
            After
          </div>
          <div className="overflow-hidden flex-1 relative">
            <div className="animate-marquee-reverse py-1 gap-4">
              {/* Duplicate array for seamless infinite reverse marquee loop */}
              {[...AFTER_ITEMS, ...AFTER_ITEMS].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div
                    key={`after-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 px-4 py-1.5 text-xs font-medium text-foreground shadow-2xs whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item.text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
