"use client"

import * as React from "react"
import {
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Building2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface LeadCardData {
  id: string
  name: string
  company: string
  value: string
  inactiveDays: number
  status: string
}

const SAMPLE_LEADS: LeadCardData[] = [
  {
    id: "lead-rahul",
    name: "Rahul Patel",
    company: "TechFlow Solutions",
    value: "$65,000",
    inactiveDays: 15,
    status: "Proposal Stalled",
  },
  {
    id: "lead-sarah",
    name: "Sarah Jenkins",
    company: "Apex Logistics",
    value: "$35,000",
    inactiveDays: 9,
    status: "Needs Follow-up",
  },
  {
    id: "lead-marcus",
    name: "Marcus Vance",
    company: "Stripe Cloud Partners",
    value: "$50,000",
    inactiveDays: 12,
    status: "Demo Completed",
  },
]

export function AICopilotSection() {
  // Simulated conversation stages: 0 = initial prompt, 1 = leads shown, 2 = action staged, 3 = approved
  const [stage, setStage] = React.useState<number>(0)
  const [approved, setApproved] = React.useState<boolean>(false)

  const handleReset = () => {
    setStage(0)
    setApproved(false)
  }

  return (
    <section id="ai-assistant" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <Bot className="h-3.5 w-3.5 text-primary" />
            <span>AI Copilot</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ask Your Business Anything.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Your AI assistant can understand what&apos;s happening across your business — from lead follow-ups to deal progress and company knowledge.
          </p>
        </div>

        {/* Realistic Chat Window Simulation */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-border/80">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  AI Business Assistant
                </span>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  Interactive Preview
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Conversation Stream */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-[460px] bg-background/50 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Message 1: User asks about leads */}
              <div className="flex items-start gap-3 justify-end">
                <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2.5 text-xs sm:text-sm max-w-[85%] sm:max-w-[70%] shadow-xs">
                  Which leads need my attention?
                </div>
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs font-bold">
                  <User className="h-4 w-4" />
                </div>
              </div>

              {/* Message 2: AI answers with count */}
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/80 px-4 py-3 text-xs sm:text-sm text-foreground space-y-2 max-w-[85%] sm:max-w-[75%]">
                  <p>
                    I found <strong className="font-semibold text-foreground">4 leads</strong> that haven&apos;t been followed up with recently.
                  </p>
                  {stage === 0 && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        onClick={() => setStage(1)}
                        className="h-7 text-xs gap-1.5 shadow-2xs"
                      >
                        <span>Show me the important ones</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message 3: Lead Cards Shown (Stage 1+) */}
              {stage >= 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm shadow-xs">
                      Show me the important ones.
                    </div>
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  </div>

                  {/* AI response with 3 lead cards */}
                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="w-full space-y-3 max-w-[90%] sm:max-w-[85%]">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SAMPLE_LEADS.map((lead) => (
                          <div
                            key={lead.id}
                            className="rounded-xl border border-border bg-card p-3.5 space-y-2 shadow-xs hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground truncate">
                                {lead.name}
                              </span>
                              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/5">
                                {lead.inactiveDays}d inactive
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">{lead.company}</span>
                            </div>
                            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                              <span className="font-semibold text-foreground">{lead.value}</span>
                              <span className="text-[10px] text-muted-foreground">{lead.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {stage === 1 && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => setStage(2)}
                            className="h-7 text-xs gap-1.5 shadow-2xs"
                          >
                            <span>Prepare a follow-up for Rahul</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message 4: Action Staged & Approved (Stage 2+) */}
              {stage >= 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-4 py-2 text-xs sm:text-sm shadow-xs">
                      Prepare a follow-up for Rahul.
                    </div>
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="w-full max-w-[85%] space-y-3">
                      <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-xs font-semibold text-foreground">
                              AI Action Prepared
                            </span>
                          </div>
                          <Badge
                            variant={approved ? "default" : "outline"}
                            className={`text-[10px] font-mono ${
                              approved
                                ? "bg-emerald-600 text-white"
                                : "border-amber-500/30 text-amber-600 bg-amber-500/10"
                            }`}
                          >
                            {approved ? "Approved" : "Waiting for your approval"}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="font-semibold text-foreground">
                            Create follow-up task: &ldquo;Send revised proposal to Rahul Patel (TechFlow)&rdquo;
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Due: Tomorrow, 10:00 AM • Priority: High • Account: TechFlow Solutions
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">
                            {approved ? "Task created in your Command Center." : "No changes until you approve."}
                          </span>
                          {!approved ? (
                            <Button
                              size="sm"
                              onClick={() => setApproved(true)}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve</span>
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 gap-1 border-emerald-500/30">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Action Approved</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Chips */}
            <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="text-[11px]">
                Try clicking the prompt buttons above to advance the simulated workflow.
              </span>
              <div className="flex items-center gap-1.5 font-medium text-primary">
                <span>Safe Sandbox</span>
                <span>•</span>
                <span>Zero Production Data Changed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
