"use client"

import * as React from "react"
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  ListTodo,
  FileText,
  ShieldCheck,
  Send,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type DemoScenario = "leads" | "deal" | "docs"

interface DemoLead {
  id: string
  name: string
  company: string
  status: string
  daysInactive: number
  valueEst: string
}

const DEMO_LEADS: DemoLead[] = [
  {
    id: "lead-1",
    name: "Rahul Patel",
    company: "TechFlow Solutions",
    status: "Proposal Stalled",
    daysInactive: 15,
    valueEst: "$65,000",
  },
  {
    id: "lead-2",
    name: "Sarah Jenkins",
    company: "Apex Logistics",
    status: "Needs Follow-up",
    daysInactive: 9,
    valueEst: "$35,000",
  },
  {
    id: "lead-3",
    name: "Marcus Vance",
    company: "Stripe Cloud Partners",
    status: "Demo Completed",
    daysInactive: 12,
    valueEst: "$50,000",
  },
]

export function InteractiveDemo() {
  const [scenario, setScenario] = React.useState<DemoScenario>("leads")
  const [step, setStep] = React.useState<number>(0)
  // Step 0: "What needs my attention?"
  // Step 1: "4 leads need follow-up." / Show leads cards
  // Step 2: "Prepare follow-up" / AI Action card appears: "Waiting for your approval"
  // Step 3: Click "Approve" -> "Action approved"
  const [selectedLeadId, setSelectedLeadId] = React.useState<string>("lead-1")
  const [actionRejected, setActionRejected] = React.useState(false)

  const handleReset = () => {
    setStep(0)
    setActionRejected(false)
    setSelectedLeadId("lead-1")
  }

  const selectedLead = DEMO_LEADS.find((l) => l.id === selectedLeadId) || DEMO_LEADS[0]

  return (
    <section id="interactive-demo" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-14">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Interactive Live Demonstration</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Try the Command Center in Real-Time
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Experience how the platform spots what needs attention, prepares the action, and waits for your approval.
          </p>
        </div>

        {/* Demo Stage Window */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Top Bar with Scenario Tabs & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/40 px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                SAFE CLIENT SIMULATION
              </Badge>
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                Zero production changes • Completely isolated demo
              </span>
            </div>

            {/* Scenario Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setScenario("leads")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  scenario === "leads"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                1. Lead Follow-Up
              </button>

              <button
                onClick={() => {
                  setScenario("deal")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  scenario === "deal"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                2. Stalled Deal Alert
              </button>

              <button
                onClick={() => {
                  setScenario("docs")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  scenario === "docs"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                3. Business Knowledge Lookup
              </button>

              <button
                onClick={handleReset}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-1 cursor-pointer"
                title="Reset simulation"
                aria-label="Reset simulation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Simulation Viewport */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Column: Operational State & Entity View */}
            <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-border bg-background space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Stepper Progress */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Demonstration Step:</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {step === 0 && "Step 1: Check Attention"}
                      {step === 1 && "Step 2: Inspect Leads"}
                      {step === 2 && "Step 3: Review Prepared Action"}
                      {step === 3 && (actionRejected ? "Action Declined" : "Step 4: Action Approved")}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Step {step + 1} of 4</span>
                </div>

                {/* Scenario 1: Stale Leads Workflow */}
                {scenario === "leads" && (
                  <div className="space-y-4">
                    {/* Signal Alert Banner */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Attention: 4 Leads Need Follow-up
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono border-amber-500/30 text-amber-700 dark:text-amber-300">
                            Review
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Several enterprise prospects haven&apos;t received follow-up recently.
                        </p>
                      </div>
                    </div>

                    {/* Step 0 CTA */}
                    {step === 0 && (
                      <div className="rounded-xl border border-border p-6 bg-muted/20 text-center space-y-3">
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                          Click below to have the AI assistant analyze your simulated business records and show the high-priority prospects.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setStep(1)}
                          className="text-xs gap-1.5 shadow-xs px-5 cursor-pointer"
                        >
                          <span>Show Leads Needing Attention</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* Step 1+: Leads Cards Grid */}
                    {step >= 1 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Prospects Flagged ({DEMO_LEADS.length})</span>
                          <span className="text-[11px]">Click a card to select</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {DEMO_LEADS.map((lead) => {
                            const isSelected = selectedLeadId === lead.id
                            return (
                              <div
                                key={lead.id}
                                onClick={() => setSelectedLeadId(lead.id)}
                                className={`rounded-xl border p-3 cursor-pointer transition-all text-xs space-y-1 ${
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                                    : "border-border bg-card hover:border-border/80"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-foreground truncate">{lead.name}</span>
                                  <Badge variant="outline" className="text-[9px] font-mono h-4 border-amber-500/30 text-amber-600">
                                    {lead.daysInactive}d inactive
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{lead.company}</p>
                                <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/60">
                                  <span>{lead.status}</span>
                                  <span className="font-bold text-foreground">{lead.valueEst}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Staging Action Prompt */}
                        {step === 1 && (
                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                            <div>
                              <span className="text-xs font-semibold text-foreground">
                                Selected: {selectedLead.name} ({selectedLead.company})
                              </span>
                              <p className="text-[11px] text-muted-foreground">
                                Would you like the AI to prepare a priority follow-up task?
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setStep(2)}
                              className="text-xs gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Prepare Follow-up for {selectedLead.name.split(" ")[0]}</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 & 3: Human Approval Card */}
                    {step >= 2 && (
                      <div className="space-y-3 pt-1">
                        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                                <ListTodo className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                AI Action Prepared
                              </span>
                            </div>
                            <Badge
                              variant={step === 3 ? (actionRejected ? "secondary" : "default") : "outline"}
                              className={`text-[10px] font-mono ${
                                step === 2
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : actionRejected
                                  ? "bg-slate-500/10 text-slate-600"
                                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              }`}
                            >
                              {step === 2 && "Waiting for your approval"}
                              {step === 3 && (actionRejected ? "Action Cancelled" : "Action Approved")}
                            </Badge>
                          </div>

                          <div className="text-xs space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Proposed Task:</span>
                              <span className="font-semibold text-foreground">
                                Follow up on proposal with {selectedLead.name}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Company Account:</span>
                              <span>{selectedLead.company}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Due Date:</span>
                              <span className="text-primary font-medium">Tomorrow, 10:00 AM</span>
                            </div>
                          </div>

                          {/* Approval Actions */}
                          {step === 2 && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setActionRejected(false)
                                  setStep(3)
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve Action</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setActionRejected(true)
                                  setStep(3)
                                }}
                                className="text-xs cursor-pointer"
                              >
                                Decline
                              </Button>
                            </div>
                          )}

                          {step === 3 && (
                            <div className="rounded-lg p-3 text-xs flex items-center justify-between bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>
                                  {actionRejected
                                    ? "Action declined. Nothing changed."
                                    : "Task created and added to your daily schedule."}
                                </span>
                              </div>
                              <button
                                onClick={handleReset}
                                className="text-[11px] underline font-medium hover:text-emerald-900 cursor-pointer"
                              >
                                Start Over
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 2: Stalled Deal Alert */}
                {scenario === "deal" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            1 Deal Inactive for 14 Days
                          </span>
                          <Badge variant="destructive" className="text-[9px] uppercase font-mono">
                            Stalled Deal
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Enterprise opportunity &ldquo;FinCorp Cloud Integration&rdquo; ($65,000) has had zero progress.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border p-4 bg-card text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground text-sm">FinCorp Cloud Integration</span>
                        <Badge variant="outline" className="font-mono text-emerald-600 font-bold">$65,000</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        Stage: <strong>Proposal</strong> • Account: FinCorp Capital
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setStep(2)}
                          className="text-xs gap-1 cursor-pointer"
                        >
                          <span>Prepare Check-in Call</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {step >= 2 && (
                      <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                          <span className="font-semibold text-foreground">Proposed Action: Schedule Call</span>
                          <Badge variant="outline" className="text-[10px] text-amber-600">Waiting for approval</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Action: Create reminder to call FinCorp Account Executive.
                        </p>
                        {step === 2 ? (
                          <Button
                            size="sm"
                            onClick={() => setStep(3)}
                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            Approve Action
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium pt-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Call scheduled in your team calendar.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 3: Business Knowledge Lookup */}
                {scenario === "docs" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            Business Knowledge: Verified Policies
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono border-blue-500/30 text-blue-600">
                            Document Search
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Instant answers from your uploaded company guides and handbooks.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border p-4 bg-card text-xs space-y-2.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Document Referenced: Enterprise_Pricing_Guidelines.pdf
                      </span>
                      <blockquote className="border-l-2 border-primary pl-3 py-1.5 text-xs text-foreground italic bg-muted/30 rounded-r">
                        &ldquo;Discounts exceeding $50,000 require written sign-off from the Operations Director before proposal delivery.&rdquo;
                      </blockquote>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified Company Document
                        </span>
                        <span>Section 4.2</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Banner at Bottom */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Your Data Stays Private • Human-Approved AI</span>
                </div>
                <span className="font-mono text-[10px]">Workspace: Acme Global</span>
              </div>
            </div>

            {/* Right Column: AI Assistant Companion */}
            <div className="lg:col-span-5 p-5 bg-muted/15 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">AI Business Assistant</h4>
                    <p className="text-[10px] text-muted-foreground">Connected to Your Business</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono text-emerald-600 border-emerald-500/30">
                  Online
                </Badge>
              </div>

              {/* Chat Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1 text-xs">
                {/* Assistant Welcome */}
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/70 p-3 text-foreground space-y-1">
                    <p className="font-semibold text-foreground">Good morning, Ishan.</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      I&apos;ve completed your daily business check. <strong>4 leads</strong> need follow-up and <strong>1 deal</strong> has been stalled for 14 days.
                    </p>
                  </div>
                </div>

                {step >= 1 && (
                  <div className="flex items-start gap-2.5 justify-end animate-in fade-in duration-200">
                    <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-3 py-1.5 text-[11px]">
                      Show me the leads needing follow-up.
                    </div>
                  </div>
                )}

                {step >= 1 && (
                  <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/70 p-3 text-foreground space-y-1 text-[11px]">
                      <p>
                        I found 4 leads that haven&apos;t been contacted recently. {selectedLead.name} ({selectedLead.company}) has been inactive for {selectedLead.daysInactive} days.
                      </p>
                    </div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="flex items-start gap-2.5 justify-end animate-in fade-in duration-200">
                    <div className="rounded-2xl rounded-tr-xs bg-primary text-primary-foreground px-3 py-1.5 text-[11px]">
                      Prepare a follow-up for {selectedLead.name.split(" ")[0]}.
                    </div>
                  </div>
                )}

                {step >= 2 && (
                  <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-muted/60 border border-border/70 p-3 text-foreground space-y-1 text-[11px]">
                      <p>
                        I&apos;ve prepared the action. It&apos;s waiting for your approval before anything changes.
                      </p>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex items-start gap-2.5 animate-in fade-in duration-200">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-emerald-500/10 border border-emerald-500/30 p-3 text-emerald-700 dark:text-emerald-300 space-y-1 text-[11px]">
                      <p className="font-semibold">Action approved!</p>
                      <p className="text-[10px] opacity-90">
                        The follow-up task has been scheduled and recorded in your Command Center.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Placeholder */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  <span className="flex-1 truncate">Ask your business anything...</span>
                  <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
                    <Send className="h-3 w-3" />
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
