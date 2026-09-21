"use client"

import * as React from "react"
import {
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  RotateCcw,
  ListTodo,
  FileText,
  ShieldCheck,
  Send,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type DemoScenario = "leads" | "deal" | "rag"

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
    name: "Sarah Jenkins",
    company: "Apex Logistics Inc",
    status: "qualifying",
    daysInactive: 9,
    valueEst: "$35,000",
  },
  {
    id: "lead-2",
    name: "Marcus Vance",
    company: "Stripe Cloud Partners",
    status: "contacted",
    daysInactive: 12,
    valueEst: "$50,000",
  },
  {
    id: "lead-3",
    name: "Elena Rostova",
    company: "Meridian BioTech",
    status: "new",
    daysInactive: 14,
    valueEst: "$22,000",
  },
]

export function InteractiveDemo() {
  const [scenario, setScenario] = React.useState<DemoScenario>("leads")
  const [step, setStep] = React.useState<number>(0)
  // Step 0: Insight detected
  // Step 1: User requested view / leads cards shown
  // Step 2: Action prepared (approval card shown)
  // Step 3: Approved & executed (audit record appended)
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
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Interactive Live Simulation</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Experience the Autonomous Workflow in Real-Time
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            See how the Command Center moves from a proactive signal to AI tool preparation and human supervisory approval.
          </p>
        </div>

        {/* Demo Stage Window */}
        <div className="mt-10 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Top Bar with Scenario Tabs & Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border bg-muted/40 px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                SANDBOX SIMULATION
              </Badge>
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                Isolated Client State • Zero Database Mutations
              </span>
            </div>

            {/* Scenario Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  setScenario("leads")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  scenario === "leads"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                1. Stale Lead Follow-up
              </button>

              <button
                onClick={() => {
                  setScenario("deal")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  scenario === "deal"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                2. Deal Velocity Risk
              </button>

              <button
                onClick={() => {
                  setScenario("rag")
                  handleReset()
                }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  scenario === "rag"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                3. RAG Knowledge Search
              </button>

              <button
                onClick={handleReset}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-1"
                title="Reset simulation"
                aria-label="Reset simulation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Main Simulation Viewport (Split: Left Stage + Right AI Copilot) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
            {/* ── Left Column: Operational State & Entity View ── */}
            <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-border bg-background space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Workflow Stepper Indicator */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Simulation Stage:</span>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {step === 0 && "1. Proactive Signal Detected"}
                      {step === 1 && "2. Analyzing Affected Entities"}
                      {step === 2 && "3. AI Action Staged (Approval Needed)"}
                      {step === 3 && (actionRejected ? "Action Rejected" : "4. Mutation Executed & Audited")}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">Step {step + 1} of 4</span>
                </div>

                {/* Scenario 1: Stale Leads Workflow */}
                {scenario === "leads" && (
                  <div className="space-y-3.5">
                    {/* Signal Alert Banner */}
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            STALE_LEAD Signal: 3 Prospects Need Attention
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono border-amber-500/30 text-amber-700 dark:text-amber-300">
                            Warning
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          3 high-value enterprise prospects have not had any logged calls, notes, or touchpoints in &gt;7 days.
                        </p>
                      </div>
                    </div>

                    {/* Step 0 CTA */}
                    {step === 0 && (
                      <div className="rounded-lg border border-border p-4 bg-muted/20 text-center space-y-3">
                        <p className="text-xs text-muted-foreground">
                          The proactive insights service automatically flagged these 3 leads from your PostgreSQL database.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setStep(1)}
                          className="text-xs gap-1.5 shadow-xs"
                        >
                          <span>Review Inactive Leads</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    {/* Step 1+: Leads Cards Grid */}
                    {step >= 1 && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Flagged Leads ({DEMO_LEADS.length})</span>
                          <span className="text-[11px]">Select a prospect to inspect</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {DEMO_LEADS.map((lead) => {
                            const isSelected = selectedLeadId === lead.id
                            return (
                              <div
                                key={lead.id}
                                onClick={() => setSelectedLeadId(lead.id)}
                                className={`rounded-lg border p-3 cursor-pointer transition-all text-xs space-y-1 ${
                                  isSelected
                                    ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                                    : "border-border bg-card hover:border-border/80"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-foreground truncate">{lead.name}</span>
                                  <Badge variant="outline" className="text-[9px] font-mono h-4">
                                    {lead.daysInactive}d inactive
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{lead.company}</p>
                                <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                                  <span>Stage: {lead.status}</span>
                                  <span className="font-semibold text-foreground">{lead.valueEst}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Staging Action Prompt */}
                        {step === 1 && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3">
                            <div>
                              <span className="text-xs font-semibold text-foreground">
                                Selected: {selectedLead.name} ({selectedLead.company})
                              </span>
                              <p className="text-[11px] text-muted-foreground">
                                Recommended Action: Stage an urgent follow-up task and notify lead owner.
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => setStep(2)}
                              className="text-xs gap-1.5 shrink-0"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>Stage Follow-Up Task</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2 & 3: Human Approval Component Simulation */}
                    {step >= 2 && (
                      <div className="space-y-3 pt-1">
                        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                                <ListTodo className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                Supervisory Gate: Pending AI Action
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
                              {step === 2 && "Awaiting Human Approval"}
                              {step === 3 && (actionRejected ? "Action Cancelled" : "Committed to PostgreSQL")}
                            </Badge>
                          </div>

                          <div className="text-xs space-y-1.5 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Action Type:</span>
                              <span className="font-mono text-foreground">create_task</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Task Title:</span>
                              <span className="font-semibold text-foreground">
                                Priority re-engagement call with {selectedLead.name}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Linked Entity:</span>
                              <span>{selectedLead.company} (Lead ID: {selectedLead.id})</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground text-[11px]">
                              <span>Due Date / Priority:</span>
                              <span className="text-rose-600 font-semibold">Tomorrow • High Priority</span>
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
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Approve &amp; Execute Mutation</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setActionRejected(true)
                                  setStep(3)
                                }}
                                className="text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {step === 3 && (
                            <div className="rounded-lg p-2.5 text-xs flex items-center justify-between bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span>
                                  {actionRejected
                                    ? "Action was cancelled. Database untouched."
                                    : "Task created in PostgreSQL with immutable activity log record."}
                                </span>
                              </div>
                              <button
                                onClick={handleReset}
                                className="text-[11px] underline font-medium hover:text-emerald-900"
                              >
                                Reset Demo
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 2: Deal Velocity Slippage */}
                {scenario === "deal" && (
                  <div className="space-y-3.5">
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-start gap-3">
                      <AlertOctagon className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            DEAL_CLOSING_SOON: Close Date Passed
                          </span>
                          <Badge variant="destructive" className="text-[9px] uppercase font-mono">
                            Critical
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Enterprise Deal &quot;FinCorp Cloud Integration&quot; ($65,000) was scheduled to close yesterday but remains in Proposal stage.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-3.5 bg-card text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground text-sm">FinCorp Cloud Integration</span>
                        <Badge variant="outline" className="font-mono text-emerald-600">$65,000 USD</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        Stage: <strong>Proposal</strong> • Account: FinCorp Capital • Account Exec: Ishan
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setStep(2)}
                          className="text-xs gap-1"
                        >
                          <span>Prepare 7-Day Extension &amp; Note</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {step >= 2 && (
                      <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                          <span className="font-semibold text-foreground">Tool: prepare_update_deal</span>
                          <Badge variant="outline" className="text-[10px] text-amber-600">Pending Approval</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Payload: New Target Close = +7 Days • Update Status = &quot;Negotiation Prep&quot;
                        </p>
                        {step === 2 ? (
                          <Button
                            size="sm"
                            onClick={() => setStep(3)}
                            className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Approve Close Date Extension
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium pt-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Deal close date safely rescheduled with audit log.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Scenario 3: RAG Knowledge Query */}
                {scenario === "rag" && (
                  <div className="space-y-3.5">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            RAG Company Knowledge: Vector Retrieval (pgvector)
                          </span>
                          <Badge variant="outline" className="text-[9px] uppercase font-mono border-blue-500/30 text-blue-600">
                            Semantic Search
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Query company SOPs and policies stored in private Supabase Storage and pgvector embeddings.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-3.5 bg-card text-xs space-y-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Document Retrieved: Enterprise_Sales_SOP.pdf (Chunk #4)
                      </span>
                      <blockquote className="border-l-2 border-primary pl-3 py-1 text-xs text-foreground italic bg-muted/30 rounded-r">
                        &quot;Section 4.2: Deals exceeding $50,000 require VP of Sales sign-off before advancing to closed_won. Standard SLA for legal review is 5 business days.&quot;
                      </blockquote>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>Similarity Score: <strong>0.924 (Cosine)</strong></span>
                        <span className="text-emerald-600 font-medium">Verified Organization Source</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Immutable Audit Trail Strip at Bottom */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Immutable Audit Trail: All Actions Tracked</span>
                </div>
                <span className="font-mono text-[10px]">Active Org: Acme Global</span>
              </div>
            </div>

            {/* ── Right Column: AI Business Copilot Chat Interface ── */}
            <div className="lg:col-span-5 p-5 bg-muted/15 flex flex-col justify-between space-y-4">
              {/* Copilot Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">AI Business Copilot</h4>
                    <p className="text-[10px] text-muted-foreground">MCP Tool Layer • Vercel AI SDK</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono text-emerald-600 border-emerald-500/30">
                  Ready
                </Badge>
              </div>

              {/* Chat Dialogue Stream */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1 text-xs">
                {/* Assistant Message 1 */}
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-lg rounded-tl-none border border-border bg-card p-3 space-y-1.5 shadow-2xs">
                    <p className="text-foreground leading-relaxed">
                      {scenario === "leads" && (
                        <>
                          Good morning! I ran a proactive audit on your CRM. Found <strong>3 enterprise leads</strong> with no touchpoint in over 7 days.
                        </>
                      )}
                      {scenario === "deal" && (
                        <>
                          Deal Alert: <strong>FinCorp Cloud Integration ($65k)</strong> was targeted to close yesterday. Would you like me to prepare an extension?
                        </>
                      )}
                      {scenario === "rag" && (
                        <>
                          I searched your uploaded SOPs. According to <strong>Enterprise_Sales_SOP.pdf</strong>, deals &gt;$50k require VP sign-off and 5 days legal review.
                        </>
                      )}
                    </p>
                    <span className="text-[9px] font-mono text-muted-foreground block">
                      Tool invoked: get_business_insights
                    </span>
                  </div>
                </div>

                {/* User Message (Triggered on step >= 1) */}
                {step >= 1 && scenario === "leads" && (
                  <div className="flex items-start gap-2 justify-end">
                    <div className="rounded-lg rounded-tr-none bg-primary text-primary-foreground p-3 space-y-1 shadow-2xs max-w-[85%]">
                      <p className="text-xs">
                        {step === 1 ? "Show me the inactive leads." : `Stage follow-up task for ${selectedLead.name}.`}
                      </p>
                      <span className="text-[9px] text-primary-foreground/70 block text-right">You • Just now</span>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}

                {/* Assistant Follow-up (Triggered on step >= 2) */}
                {step >= 2 && scenario === "leads" && (
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-lg rounded-tl-none border border-border bg-card p-3 space-y-1.5 shadow-2xs">
                      <p className="text-foreground leading-relaxed">
                        I&apos;ve staged the follow-up task for <strong>{selectedLead.name}</strong>. As per our security protocol, I cannot write directly to your database without your authorization.
                      </p>
                      <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2 text-[11px] text-amber-700 dark:text-amber-300">
                        {step === 2
                          ? "Awaiting your click on 'Approve Mutation' in the approval card."
                          : actionRejected
                          ? "Action rejected. Mutation cancelled."
                          : "Action approved! The task is now recorded in PostgreSQL."}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 shadow-2xs">
                  <input
                    type="text"
                    readOnly
                    value={
                      step === 0
                        ? "What needs my attention today?"
                        : step === 1
                        ? `Stage follow-up task for ${selectedLead.name}...`
                        : "Ready for your approval..."
                    }
                    className="flex-1 bg-transparent text-xs text-muted-foreground outline-none cursor-default"
                  />
                  <Button
                    size="sm"
                    className="h-7 w-7 p-0 rounded-md"
                    onClick={() => {
                      if (step < 3) setStep(step + 1)
                      else handleReset()
                    }}
                    title="Advance simulation"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <span className="text-[10px] text-muted-foreground text-center block pt-1.5">
                  Click the action buttons or arrow to advance the interactive sequence.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
