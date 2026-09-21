"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  TrendingUp,
  Play,
  Clock,
  Users,
  Briefcase,
  ChevronRight,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMouseTilt } from "@/hooks/use-mouse-tilt"

export function HeroSection() {
  const { ref: tiltRef } = useMouseTilt<HTMLDivElement>({
    maxRotation: 4,
    perspective: 1400,
    scale: 1.01,
  })

  // Sequential entrance animation states
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32">
      {/* Ambient background glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[450px] w-[750px] rounded-full bg-primary/6 blur-3xl" />
        <div className="h-[300px] w-[500px] rounded-full bg-blue-500/5 blur-3xl -translate-y-24" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Subheader Pill */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1 text-xs font-medium text-foreground transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>One Intelligent Workspace for Growing Teams</span>
          </div>

          {/* Primary Headline */}
          <h1
            className={`text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.12] transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Your Business.
            <span className="block text-primary">One Intelligent Command Center.</span>
          </h1>

          {/* Supporting Copy */}
          <p
            className={`text-base sm:text-lg lg:text-xl text-muted-foreground text-balance leading-relaxed max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Keep your leads, customers, deals, tasks and business knowledge in one place — and let AI help you understand what needs attention.
          </p>

          {/* CTA Buttons */}
          <div
            className={`pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 transition-all duration-700 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className: "w-full sm:w-auto gap-2 px-7 text-sm font-semibold shadow-md hover:scale-[1.02] transition-all duration-200",
              })}
            >
              <span>Explore the Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "w-full sm:w-auto gap-2 text-sm font-medium hover:bg-muted/80 transition-all duration-200",
              })}
            >
              <Play className="h-3.5 w-3.5 text-primary fill-primary/20" />
              <span>See How It Works</span>
            </a>
          </div>

          {/* Core Trust Badges */}
          <div
            className={`pt-3 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground transition-all duration-700 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Private &amp; Secure Workspace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>You Approve Every AI Action</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Real Business Insights</span>
            </div>
          </div>
        </div>

        {/* Real Product Dashboard Visualization with Sequential Reveal & Mouse Tilt */}
        <div
          className={`mt-12 sm:mt-16 relative mx-auto max-w-5xl transition-all duration-1000 delay-500 ${
            mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-[0.98]"
          }`}
        >
          <div
            ref={tiltRef}
            className="rounded-2xl border border-border/90 bg-card shadow-2xl overflow-hidden transition-all duration-300 backdrop-blur-xs group"
          >
            {/* Window Chrome */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  commandcenter.internal/dashboard • Acme Global
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  LIVE WORKSPACE
                </Badge>
              </div>
            </div>

            {/* Dashboard Inner Canvas */}
            <div className="p-4 sm:p-6 lg:p-7 space-y-6 bg-background/50">
              {/* Top Banner: Proactive Insights ("Today's Attention") */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:p-4 transition-all duration-700 delay-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Today&apos;s Attention
                      </span>
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      4 leads need follow-up • 1 high-value deal inactive for 14 days • 3 tasks due today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="destructive" className="text-[10px] font-mono">1 Urgent</Badge>
                  <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">3 Review</Badge>
                  <span className="text-xs text-primary font-medium flex items-center gap-0.5 hover:underline cursor-pointer">
                    Review All <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>Pipeline Value</span>
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    $142,500
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span>+18.4%</span>
                    <span className="text-muted-foreground">vs last month</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>Active Deals</span>
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    18 Deals
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    4 in negotiation stage
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>Hot Leads</span>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    32 Leads
                  </div>
                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    4 need follow-up
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:border-primary/40 hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center justify-between text-muted-foreground text-xs">
                    <span>Tasks Due Today</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    5 Tasks
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    2 high-priority items
                  </div>
                </div>
              </div>

              {/* Lower Section: Split View of Visual Pipeline + AI Assistant */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Visual Deal Pipeline */}
                <div className="lg:col-span-7 rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Deal Pipeline
                      </h4>
                      <p className="text-sm font-semibold text-foreground">
                        Stages &amp; Progress
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-normal">
                      5 Stages Active
                    </Badge>
                  </div>

                  {/* Visual Stage Columns */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Lead In</span>
                        <span className="font-semibold text-foreground">5</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-full bg-primary/60" />
                      </div>
                      <div className="text-[10px] text-muted-foreground">$24,000</div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Contacted</span>
                        <span className="font-semibold text-foreground">4</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-4/5 bg-primary/70" />
                      </div>
                      <div className="text-[10px] text-muted-foreground">$38,500</div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Proposal</span>
                        <span className="font-semibold text-foreground">3</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-3/5 bg-primary/80" />
                      </div>
                      <div className="text-[10px] text-muted-foreground">$42,000</div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2 hidden sm:block">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Negotiation</span>
                        <span className="font-semibold text-foreground">4</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-4/5 bg-primary" />
                      </div>
                      <div className="text-[10px] text-muted-foreground">$26,000</div>
                    </div>

                    <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 space-y-2 hidden sm:block">
                      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <span>Won</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">2</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <div className="h-full w-full bg-emerald-500" />
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">$12,000</div>
                    </div>
                  </div>

                  {/* Active Deal Sample Row */}
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">
                        CloudScale Systems Expansion
                      </div>
                      <div className="text-muted-foreground text-[11px]">
                        Apex Logistics • In Proposal stage for 18 days
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-foreground">$48,000</div>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">
                        Needs Attention
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Right: AI Copilot Assistant Widget */}
                <div className="lg:col-span-5 rounded-xl border border-primary/25 bg-card p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">
                          AI Business Assistant
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    </div>

                    {/* Simulated Assistant Message */}
                    <div className="rounded-lg bg-muted/40 p-3 text-xs text-foreground space-y-1.5 border border-border/60">
                      <p className="leading-relaxed">
                        I noticed <strong className="font-semibold">4 leads</strong> haven&apos;t received follow-up in over 10 days. Would you like me to draft personalized check-ins?
                      </p>
                      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-primary font-medium cursor-pointer hover:underline">
                        <span>Review suggested follow-ups</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                      Quick Questions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                        Which deals are stalled?
                      </span>
                      <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                        What is our refund policy?
                      </span>
                      <span className="rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
                        Summarize today&apos;s tasks
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
