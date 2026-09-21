"use client"

import * as React from "react"
import Image from "next/image"
import {
  FileSpreadsheet,
  MessageSquare,
  FileText,
  CheckSquare,
  Layers,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface StoryStep {
  badge: string
  title: string
  subtitle: string
  description: string
  points: string[]
}

const STORY_STEPS: StoryStep[] = [
  {
    badge: "The Problem",
    title: "Your information is everywhere.",
    subtitle: "When customer data lives in five different tools, revenue quietly slips through the cracks.",
    description:
      "Leads are buried in spreadsheets, client conversations happen in Slack and emails, tasks are scribbled on notes, and important documents sit lost in Google Drive. You spend half your day just finding what needs to be done.",
    points: [
      "No single view of customer history or deal status",
      "Follow-ups get forgotten after initial calls",
      "Hours wasted manually compiling status updates",
    ],
  },
  {
    badge: "Step 1: One Place",
    title: "Bring it all together.",
    subtitle: "Leads, customers, deals, tasks, and documents in one central Command Center.",
    description:
      "Instead of switching between disconnected tabs, your entire operational flow lives in a single, unified workspace. Every team member sees the same clear picture.",
    points: [
      "Visual sales pipeline updated in real time",
      "Complete customer timelines with zero missing history",
      "Unified task orchestration tied directly to deals",
    ],
  },
  {
    badge: "Step 2: AI Understanding",
    title: "Now AI can understand it.",
    subtitle: "Your AI assistant can see the big picture across your entire business.",
    description:
      "Because all your data lives together, your AI assistant can actually understand relationships between clients, open deals, past emails, and company policies.",
    points: [
      "Ask natural questions about any customer or deal",
      "Search across company playbooks, SOPs, and policies",
      "Understand which relationships need nurturing",
    ],
  },
  {
    badge: "Step 3: Proactive Help",
    title: "Now it can help.",
    subtitle: "Know what needs attention before you have to ask.",
    description:
      "The Command Center doesn't wait for things to go wrong. It proactively checks your data and alerts you to overdue tasks, cold leads, and stalled deals.",
    points: [
      "Morning executive briefing with clear daily priorities",
      "Instant flags when a high-value deal goes silent",
      "Automatic detection of forgotten lead follow-ups",
    ],
  },
  {
    badge: "Step 4: Human Control",
    title: "You're still in control.",
    subtitle: "AI suggests the action. You approve it before anything changes.",
    description:
      "Your business is too important to run on autopilot. The AI prepares follow-ups, draft emails, and task assignments, but nothing touches your data until you click approve.",
    points: [
      "Clear visual preview of every proposed change",
      "One-click approval or rejection with audit tracking",
      "Zero unwanted automated modifications",
    ],
  },
]

export function ScrollStorySection() {
  const [activeStep, setActiveStep] = React.useState<number>(0)

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16 sm:mb-20">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>What Gets Easier?</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From Chaotic Business Tools to One Intelligent Hub
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Follow the journey from scattered information to proactive, human-approved clarity.
          </p>
        </div>

        {/* Step Selector Pills for Easy Navigation */}
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
          {STORY_STEPS.map((step, idx) => (
            <button
              key={`pill-${idx}`}
              onClick={() => setActiveStep(idx)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeStep === idx
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {idx === 0 ? "The Problem" : `Step ${idx}`}
            </button>
          ))}
        </div>

        {/* 2-Column Story Experience */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Story Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <Badge
                variant={activeStep === 0 ? "destructive" : "secondary"}
                className="text-xs font-mono uppercase tracking-wider"
              >
                {STORY_STEPS[activeStep].badge}
              </Badge>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {STORY_STEPS[activeStep].title}
              </h3>
              <p className="text-base font-medium text-primary">
                {STORY_STEPS[activeStep].subtitle}
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {STORY_STEPS[activeStep].description}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="space-y-2.5 pt-2">
              {STORY_STEPS[activeStep].points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="text-xs"
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setActiveStep((prev) =>
                    prev < STORY_STEPS.length - 1 ? prev + 1 : 0
                  )
                }
                className="text-xs gap-1.5"
              >
                <span>
                  {activeStep === STORY_STEPS.length - 1 ? "Start Over" : "Next Step"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                {activeStep + 1} of {STORY_STEPS.length}
              </span>
            </div>
          </div>

          {/* Right Column: Visual Stage Graphic */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl min-h-[420px] flex flex-col justify-center overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 -z-10 bg-linear-to-tr from-primary/5 via-transparent to-muted/20" />

              {/* STAGE 0: CHAOTIC SCATTERED APPS */}
              {activeStep === 0 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1 mb-2">
                    <span className="text-xs font-mono uppercase text-destructive font-semibold">
                      Current Reality: Scattered Tools
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Data locked away in disconnected silos
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3.5 space-y-2 rotate-[-1deg]">
                      <div className="flex items-center gap-2 text-destructive">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span className="text-xs font-bold">Spreadsheets</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Stale lead lists, manual formulas, out-of-sync tabs
                      </p>
                    </div>

                    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3.5 space-y-2 rotate-[1.5deg]">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-bold">Messages</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Customer updates lost in Slack and email threads
                      </p>
                    </div>

                    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3.5 space-y-2 rotate-[-2deg]">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-bold">Documents</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Playbooks and policies hidden in Google Drive
                      </p>
                    </div>

                    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3.5 space-y-2 rotate-[2deg]">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <CheckSquare className="h-4 w-4" />
                        <span className="text-xs font-bold">Tasks</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Missed deadlines and sticky note reminders
                      </p>
                    </div>

                    <div className="rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-3 space-y-1.5 col-span-2 sm:col-span-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-bold">The Reality</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Deals quietly stall, follow-ups are missed, and business owners have no clear view of revenue.
                      </p>
                    </div>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-border/80 shadow-xs aspect-16/9 mt-1">
                    <Image
                      src="/images/scattered-to-unified.jpg"
                      alt="Scattered business data transforming into organized command center"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent flex items-end p-3">
                      <p className="text-[11px] text-foreground font-medium">
                        Scattered documents, tasks, and leads waiting for structure
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 1: BRING IT TOGETHER (ONE WORKSPACE) */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1 mb-2">
                    <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                      One Central Hub
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Everything converges into one Command Center
                    </p>
                  </div>

                  {/* Visual workspace preview */}
                  <div className="relative rounded-xl overflow-hidden border border-border shadow-md aspect-16/9">
                    <Image
                      src="/images/executive-workspace.jpg"
                      alt="Modern executive workspace with Command Center"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent flex items-end p-4">
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-background/90 text-xs font-medium text-foreground">
                          Unified Architecture
                        </Badge>
                        <p className="text-xs text-foreground font-semibold">
                          Leads • Deals • Customers • Tasks • Documents
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: AI UNDERSTANDS YOUR BUSINESS */}
              {activeStep === 2 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1 mb-1">
                    <span className="text-xs font-mono uppercase text-primary font-semibold">
                      Grounded AI Assistant
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Instant answers backed by your real business context
                    </p>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 shadow-sm">
                    {/* User Question */}
                    <div className="flex items-start gap-2.5 justify-end">
                      <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-3.5 py-2 text-xs max-w-[85%]">
                        Which enterprise deals haven&apos;t moved in the last 2 weeks?
                      </div>
                    </div>

                    {/* AI Answer */}
                    <div className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/80 px-3.5 py-2 text-xs text-foreground space-y-1.5 max-w-[90%]">
                        <p>
                          I identified <strong>CloudScale Systems ($48,000)</strong> in the Proposal stage with zero activity for 18 days.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge variant="outline" className="text-[10px] bg-background">
                            Lead: Marcus Vance
                          </Badge>
                          <span className="text-[10px] text-primary font-medium cursor-pointer hover:underline">
                            View Deal Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: PROACTIVE HELP */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1 mb-1">
                    <span className="text-xs font-mono uppercase text-amber-600 dark:text-amber-400 font-semibold">
                      Automatic Daily Briefing
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Alerts before revenue or tasks slip
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
                        <div>
                          <div className="font-semibold text-foreground">3 tasks are overdue</div>
                          <div className="text-[11px] text-muted-foreground">Assigned to Account Execs</div>
                        </div>
                      </div>
                      <Badge variant="destructive" className="text-[10px]">Action Needed</Badge>
                    </div>

                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                        <div>
                          <div className="font-semibold text-foreground">4 leads need follow-up</div>
                          <div className="text-[11px] text-muted-foreground">Untouched for over 10 days</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">Review</Badge>
                    </div>

                    <div className="rounded-xl border border-primary/25 bg-primary/5 p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div>
                          <div className="font-semibold text-foreground">1 deal represents 48% of pipeline</div>
                          <div className="text-[11px] text-muted-foreground">Concentration risk identified</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Insight</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 4: YOU STAY IN CONTROL */}
              {activeStep === 4 && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-center space-y-1 mb-1">
                    <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                      Human Supervisory Gate
                    </span>
                    <p className="text-xs text-muted-foreground">
                      AI prepares the work. You make the call.
                    </p>
                  </div>

                  {/* Pending Action Card */}
                  <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          Action Waiting for Approval
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">
                        Pending
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="font-semibold text-foreground">
                        Create follow-up task: &ldquo;Check in with Rahul Patel&rdquo;
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Assignee: Sarah Chen • Due: Tomorrow at 10:00 AM • Priority: High
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                        Decline
                      </Button>
                      <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Approve Action</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
