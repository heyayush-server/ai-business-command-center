"use client"

import * as React from "react"
import {
  Layers,
  Database,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useScrollStory } from "@/hooks/use-scroll-story"

interface StoryStep {
  title: string
  subtitle: string
  badge: string
  description: string
  bullets: string[]
}

const STORY_STEPS: StoryStep[] = [
  {
    badge: "The Problem",
    title: "Scattered Spreadsheets & Missed Signals",
    subtitle: "When customer data lives in silos, revenue slips through the cracks.",
    description:
      "Most growing organizations manage prospects in one tool, deals in another, tasks in Slack, and documents across Google Drive. Key follow-ups are forgotten, deal close dates quietly expire, and executives have no single operational source of truth.",
    bullets: [
      "Stalled deals go unnoticed until quarters end.",
      "Leads go cold after initial qualification calls.",
      "No unified audit trail across teams.",
    ],
  },
  {
    badge: "The Foundation",
    title: "One Multi-Tenant PostgreSQL Command Center",
    subtitle: "Leads, deals, accounts, and tasks bound by Row-Level Security.",
    description:
      "The Command Center unifies every operational vector into a unified relational schema. Every query is organization-scoped, ensuring complete tenant isolation and sub-millisecond aggregations.",
    bullets: [
      "PostgreSQL Row-Level Security on every table.",
      "Real-time pipeline calculations without N+1 bottlenecks.",
      "Immutable audit log attributing every system and user action.",
    ],
  },
  {
    badge: "Proactive AI Engine",
    title: "Deterministic Intelligence, Zero Hallucinations",
    subtitle: "Continuous background analysis flags risks before they cost revenue.",
    description:
      "Instead of waiting for a user prompt, the Phase 14 insight engine scans real database records for SLA delays, overdue task deadlines, stale pipeline concentrations, and communication gaps.",
    bullets: [
      "10 deterministic insight types derived from real data.",
      "Clear severity tiers: Critical, Warning, and Info.",
      "Hallucination-free executive briefings with exact counts.",
    ],
  },
  {
    badge: "Safe Execution",
    title: "Human-in-the-Loop AI Tool Actions",
    subtitle: "The AI prepares the mutation; the human supervisor holds the key.",
    description:
      "Through the Model Context Protocol (MCP), the AI Copilot can read data freely to answer questions, but write actions (creating deals, completing tasks, reassigning leads) are staged into pending actions awaiting one-click human approval.",
    bullets: [
      "AI cannot directly mutate production database records.",
      "Staged actions expire after 15 minutes to prevent stale replays.",
      "Full Zod schema re-validation at execution time.",
    ],
  },
]

export function ScrollStorySection() {
  const { containerRef, activeStep, setActiveStep } = useScrollStory(STORY_STEPS.length)

  return (
    <section id="story" className="py-20 lg:py-32 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16 sm:mb-20">
          <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>The Product Journey</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From Fragmented Silos to Supervised Intelligence
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Scroll through to understand how the platform transforms chaotic data into proactive business execution.
          </p>
        </div>

        {/* Story Interactive Grid */}
        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Scrollable Text Steps */}
          <div className="lg:col-span-6 space-y-16 sm:space-y-24">
            {STORY_STEPS.map((step, idx) => {
              const isActive = activeStep === idx
              return (
                <div
                  key={step.title}
                  data-story-step={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20"
                      : "border-border/60 bg-card/40 opacity-70 hover:opacity-100 hover:border-border"
                  }`}
                >
                  <div className="space-y-3">
                    <Badge
                      variant={isActive ? "default" : "outline"}
                      className="text-[10px] font-mono uppercase px-2 py-0.5"
                    >
                      Step 0{idx + 1} • {step.badge}
                    </Badge>

                    <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      {step.title}
                    </h3>

                    <p className="text-sm font-medium text-primary leading-relaxed">
                      {step.subtitle}
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                      {step.description}
                    </p>

                    <ul className="space-y-2 pt-3 border-t border-border/60 text-xs text-foreground">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Sticky Morphing Visualization Canvas */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 mt-6 lg:mt-0">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-5 min-h-[460px] flex flex-col justify-between backdrop-blur-xs transition-all duration-300">
              {/* Canvas Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-2xs">
                    {activeStep === 0 && <FileSpreadsheet className="h-4 w-4" />}
                    {activeStep === 1 && <Database className="h-4 w-4" />}
                    {activeStep === 2 && <Sparkles className="h-4 w-4" />}
                    {activeStep === 3 && <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      {activeStep === 0 && "Current Reality: Disconnected Silos"}
                      {activeStep === 1 && "Unified Data Foundation (PostgreSQL)"}
                      {activeStep === 2 && "Autonomous Intelligence Engine (Phase 14)"}
                      {activeStep === 3 && "Supervised Action Staging (Phase 11/13)"}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      State: Visualizing Architecture Stage 0{activeStep + 1}
                    </span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-mono">
                  LIVE VISUALIZER
                </Badge>
              </div>

              {/* Dynamic Canvas Body Based on activeStep */}
              <div className="flex-1 flex flex-col justify-center">
                {/* ── State 0: The Problem ── */}
                {activeStep === 0 && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="rounded-xl border border-dashed border-rose-500/40 bg-rose-500/5 p-4 space-y-2 text-xs">
                      <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Disconnected Spreadsheets &amp; Chat Channels
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Deal &quot;Global Retail&quot; closed 3 days ago, but tasks were never created. Follow-up forgotten.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Orphaned Leads</span>
                        <p className="font-bold text-foreground">18 untracked prospects</p>
                        <span className="text-[10px] text-rose-500">No contact in &gt;14 days</span>
                      </div>
                      <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Slipped Deals</span>
                        <p className="font-bold text-foreground">$64,000 at risk</p>
                        <span className="text-[10px] text-rose-500">Close dates expired</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── State 1: Unified Foundation ── */}
                {activeStep === 1 && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">PostgreSQL Multi-Tenancy Engine</span>
                        <Badge variant="outline" className="text-[10px] font-mono text-primary">
                          RLS Enforced
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Every query evaluates tenant boundaries using private-schema security functions.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Leads</span>
                        <p className="font-bold text-foreground">42 Active</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Pipeline</span>
                        <p className="font-bold text-foreground">$142,800</p>
                      </div>
                      <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                        <span className="text-[10px] text-muted-foreground">Tasks</span>
                        <p className="font-bold text-foreground">27 Synced</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── State 2: Proactive Intelligence ── */}
                {activeStep === 2 && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-600" />
                          Proactive Anomaly Detected
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase font-mono text-amber-700 border-amber-500/30">
                          Critical Priority
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        2 overdue operational tasks with high client SLA impact • 1 deal in negotiation for 18 days.
                      </p>
                    </div>

                    <div className="rounded-lg border border-border bg-background p-3 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                        <span>Analysis Service</span>
                        <span className="font-mono">insights.service.ts</span>
                      </div>
                      <p className="text-foreground font-semibold">
                        Grounded, deterministic evaluation across all 5 domain tables.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── State 3: Supervised Execution ── */}
                {activeStep === 3 && (
                  <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          Human Supervisory Gate
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase font-mono text-emerald-700 border-emerald-500/30">
                          Secure Commit
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Action staged in <code className="bg-background px-1 py-0.5 rounded font-mono">ai_pending_actions</code>. Awaiting supervisor signature.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <div className="h-2 w-full rounded-full bg-emerald-200 dark:bg-emerald-950 overflow-hidden">
                          <div className="h-full bg-emerald-600 w-full" />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 shrink-0">100% Authorized</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Canvas Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Phase 14 Proactive Architecture</span>
                <span className="font-mono text-primary font-semibold">Step {activeStep + 1} / 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
