"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Sparkles,
  Bot,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Play,
  Database,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMouseTilt } from "@/hooks/use-mouse-tilt"

export function HeroSection() {
  const { ref: tiltRef } = useMouseTilt<HTMLDivElement>({
    maxRotation: 5,
    perspective: 1200,
    scale: 1.01,
  })

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-24 lg:pb-32">
      {/* Subtle Background Glow Elements */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[420px] w-[700px] rounded-full bg-primary/8 blur-3xl" />
        <div className="h-[300px] w-[500px] rounded-full bg-blue-500/5 blur-3xl -translate-y-24" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-5">
          {/* Subheader Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>Next.js 16 + Supabase RLS + Vercel AI SDK 7.0</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary font-semibold">Phase 14 Active</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-[1.12]">
            Your Entire Business,
            <span className="block text-primary">With an Autonomous AI Copilot.</span>
          </h1>

          {/* Value Proposition */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground text-balance leading-relaxed max-w-2xl mx-auto">
            A unified operations platform synthesizing{" "}
            <strong className="text-foreground font-semibold">CRM</strong> +{" "}
            <strong className="text-foreground font-semibold">AI Copilot</strong> +{" "}
            <strong className="text-foreground font-semibold">Business Intelligence</strong> +{" "}
            <strong className="text-foreground font-semibold">RAG Knowledge</strong> +{" "}
            <strong className="text-foreground font-semibold">Proactive Insights</strong> with{" "}
            <strong className="text-foreground font-semibold">human-supervised execution</strong>.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className={buttonVariants({
                size: "lg",
                className: "w-full sm:w-auto gap-2 px-7 text-sm font-semibold shadow-md",
              })}
            >
              <span>Explore the Command Center</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#interactive-demo"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "w-full sm:w-auto gap-2 text-sm font-medium",
              })}
            >
              <Play className="h-3.5 w-3.5 text-primary fill-primary/20" />
              <span>See AI in Action</span>
            </a>
          </div>

          {/* Core Trust Pillars */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>PostgreSQL Row-Level Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Human-Approved AI Mutations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Deterministic Insights (Zero Fake Numbers)</span>
            </div>
          </div>
        </div>

        {/* Realistic Product Visualization with 3D Mouse Tilt Parallax */}
        <div className="mt-12 sm:mt-16 relative mx-auto max-w-5xl">
          <div
            ref={tiltRef}
            className="rounded-2xl border border-border/90 bg-card shadow-2xl overflow-hidden transition-all duration-200 backdrop-blur-xs"
          >
            {/* Window Chrome */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  commandcenter.internal/dashboard • organization: Acme Global
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  LIVE WORKSPACE DEMO
                </Badge>
              </div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-4 sm:p-6 lg:p-7 bg-background/95 space-y-5">
              {/* Proactive Intelligence Banner */}
              <div className="rounded-xl border border-primary/25 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0 shadow-2xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">
                        Proactive Business Signal: 2 Critical SLA Items
                      </span>
                      <Badge variant="destructive" className="text-[9px] uppercase px-1.5 py-0 h-4">
                        Action Needed
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      3 stale leads detected without contact for 14d • Deal &quot;Acme Corp Cloud&quot; target close date overdue.
                    </p>
                  </div>
                </div>

                <a
                  href="#interactive-demo"
                  className={buttonVariants({ size: "sm", className: "h-7 text-xs gap-1 self-start sm:self-auto" })}
                >
                  <span>Resolve with Copilot</span>
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {/* Realistic Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Active Pipeline</span>
                  <p className="text-xl font-bold tracking-tight text-foreground">$142,800</p>
                  <span className="text-[10px] text-emerald-600 font-medium">↑ 18.4% vs last month</span>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Active Leads</span>
                  <p className="text-xl font-bold tracking-tight text-foreground">42</p>
                  <span className="text-[10px] text-amber-600 font-medium">3 require immediate follow-up</span>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-medium text-muted-foreground">Customer Accounts</span>
                  <p className="text-xl font-bold tracking-tight text-foreground">89</p>
                  <span className="text-[10px] text-emerald-600 font-medium">98.4% retention rate</span>
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1 shadow-2xs">
                  <span className="text-[11px] font-medium text-muted-foreground">AI Action Staging</span>
                  <p className="text-xl font-bold tracking-tight text-foreground">1 Pending</p>
                  <span className="text-[10px] text-primary font-medium">Awaiting supervisor signature</span>
                </div>
              </div>

              {/* Split Interactive Preview: Mini Kanban + AI Copilot Stream */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
                {/* Left: Pipeline Snapshot */}
                <div className="md:col-span-7 rounded-xl border border-border/80 bg-muted/15 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Sales Pipeline Velocity
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">3 Stages Active</span>
                  </div>

                  <div className="space-y-2">
                    <div className="rounded-lg border border-border/60 bg-background p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-foreground">Discovery &amp; Qualification</span>
                        <p className="text-[10px] text-muted-foreground">Acme Corp ($25k) • 80% fit score</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">Stage 1</Badge>
                    </div>

                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">Proposal Review</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        </div>
                        <p className="text-[10px] text-muted-foreground">Global Logistics ($48k) • Target Close: Today</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-mono text-amber-600 bg-amber-50 dark:bg-amber-950/40">
                        Attention
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-background p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-medium text-foreground">Negotiation</span>
                        <p className="text-[10px] text-muted-foreground">FinCorp Migration ($65k) • In SLA</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">Stage 3</Badge>
                    </div>
                  </div>
                </div>

                {/* Right: AI Supervisory Approval Card Floating */}
                <div className="md:col-span-5 rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Bot className="h-3.5 w-3.5 text-primary" />
                        <span>AI Action Staged</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono bg-amber-500/10 text-amber-600 border-amber-500/30">
                        Awaiting Human Signature
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-background p-2.5 text-xs space-y-1">
                      <span className="text-[10px] font-mono text-muted-foreground">Tool: prepare_create_task</span>
                      <p className="text-xs font-medium text-foreground">
                        &quot;Executive follow-up call with Global Logistics regarding Q3 terms&quot;
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <span>Due: Tomorrow</span>
                        <span>•</span>
                        <span className="text-rose-600 font-medium">Priority: Urgent</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button className="w-full h-7 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Approve Mutation</span>
                    </button>
                    <button className="h-7 px-2.5 rounded-md border border-border text-muted-foreground hover:bg-muted text-[11px] transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ambient Floating Callout Badges */}
          <div className="hidden lg:flex absolute -bottom-5 -left-6 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">PostgreSQL RLS Active</p>
              <p className="text-[10px] text-muted-foreground">Cross-tenant leakage mathematically prevented</p>
            </div>
          </div>

          <div className="hidden lg:flex absolute -top-5 -right-6 rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">pgvector RAG Knowledge</p>
              <p className="text-[10px] text-muted-foreground">Untrusted document sanitization applied</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
