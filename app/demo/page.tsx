"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  CheckSquare,
  CircleDot,
  Database,
  FileText,
  LayoutDashboard,
  Lock,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MOCK_DEV_ACTIVITIES, MOCK_DEV_CUSTOMERS, MOCK_DEV_DEALS, MOCK_DEV_LEADS, MOCK_DEV_TASKS } from "@/lib/mock/crm-entities"

const demoNav = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "crm", label: "CRM", icon: Users },
  { id: "knowledge", label: "Knowledge", icon: FileText },
  { id: "ai", label: "AI Copilot", icon: Bot },
  { id: "approval", label: "Approval", icon: ShieldCheck },
] as const

type DemoSection = (typeof demoNav)[number]["id"]

export default function DemoPage() {
  const [activeSection, setActiveSection] = React.useState<DemoSection>("dashboard")
  const [approved, setApproved] = React.useState(false)
  const [query, setQuery] = React.useState("Which accounts need attention today?")

  const openDealsValue = MOCK_DEV_DEALS.filter((deal) => !["closed_won", "closed_lost"].includes(deal.stage)).reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0
  )
  const dueSoon = MOCK_DEV_TASKS.filter((task) => task.status !== "done").length

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <CircleDot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Command Center Demo</p>
              <p className="text-[11px] text-muted-foreground">No account, no production data, no database writes.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
              <Lock className="h-3 w-3" />
              Isolated demo data
            </Badge>
            <Link
              href="/"
              className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-xs" })}
            >
              Landing
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm", className: "h-8 gap-1.5 text-xs" })}>
              <span>Sign in to use real workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border border-border bg-card p-2 shadow-2xs lg:sticky lg:top-24">
          <nav className="grid gap-1 sm:grid-cols-5 lg:grid-cols-1">
            {demoNav.map((item) => {
              const Icon = item.icon
              const active = activeSection === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Demo guardrail
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Actions are simulated in browser state. This route never requests private workspace records.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <section className="rounded-xl border border-border bg-linear-to-br from-card via-card to-muted/40 p-5 shadow-2xs sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wide">
                  Portfolio-safe product tour
                </Badge>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Explore the AI Business Command Center without logging in.
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This demo uses deterministic sample leads, customers, deals, tasks, knowledge snippets, and approval states so you can inspect the real workflow without exposing or changing production data.
                </p>
              </div>
              <div className="grid min-w-0 grid-cols-3 gap-2 sm:min-w-[360px]">
                <Stat label="Open pipeline" value={`$${openDealsValue.toLocaleString()}`} />
                <Stat label="Active leads" value={MOCK_DEV_LEADS.length.toString()} />
                <Stat label="Tasks due" value={dueSoon.toString()} />
              </div>
            </div>
          </section>

          {activeSection === "dashboard" && (
            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Executive Dashboard
                  </CardTitle>
                  <CardDescription>Simulated KPIs, priority queue, and recent activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label="Customers" value={MOCK_DEV_CUSTOMERS.length.toString()} />
                    <Stat label="Deals" value={MOCK_DEV_DEALS.length.toString()} />
                    <Stat label="Tasks" value={MOCK_DEV_TASKS.length.toString()} />
                    <Stat label="Activities" value={MOCK_DEV_ACTIVITIES.length.toString()} />
                  </div>
                  <div className="space-y-2">
                    {MOCK_DEV_TASKS.map((task) => (
                      <Row
                        key={task.id}
                        icon={<CheckSquare className="h-4 w-4 text-amber-600" />}
                        title={task.title}
                        meta={`${task.priority} priority - due ${task.due_date}`}
                        badge={task.status.replace("_", " ")}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Proactive Insights
                  </CardTitle>
                  <CardDescription>Deterministic signals from the demo workspace.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Insight severity="Warning" title="Proposal stage is aging" body="Starlight Digital has a proposal-stage deal with legal review pending." />
                  <Insight severity="Critical" title="High-priority task due soon" body="Security questionnaire response is due in the next business day." />
                  <Insight severity="Info" title="Knowledge source available" body="Refund policy and SOC2 notes can be searched by the AI copilot." />
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "crm" && (
            <div className="grid gap-4 xl:grid-cols-3">
              <EntityCard title="Leads" icon={<Users className="h-4 w-4 text-blue-600" />} items={MOCK_DEV_LEADS.map((lead) => ({
                title: `${lead.first_name} ${lead.last_name}`,
                meta: `${lead.company} - ${lead.status}`,
              }))} />
              <EntityCard title="Customers" icon={<Building2 className="h-4 w-4 text-emerald-600" />} items={MOCK_DEV_CUSTOMERS.map((customer) => ({
                title: customer.name,
                meta: `${customer.industry ?? "General"} - ${customer.status}`,
              }))} />
              <EntityCard title="Deals" icon={<TrendingUp className="h-4 w-4 text-indigo-600" />} items={MOCK_DEV_DEALS.map((deal) => ({
                title: deal.title,
                meta: `$${Number(deal.value).toLocaleString()} - ${deal.stage.replace("_", " ")}`,
              }))} />
            </div>
          )}

          {activeSection === "knowledge" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="h-4 w-4 text-primary" />
                  Knowledge and RAG Demo
                </CardTitle>
                <CardDescription>Static, private sample documents simulate retrieval without uploads or production storage.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  {["Refund policy", "SOC2 security packet", "Enterprise pricing guide"].map((doc) => (
                    <Row key={doc} icon={<FileText className="h-4 w-4 text-primary" />} title={doc} meta="Processed - 4 chunks - demo vector index" badge="Demo" />
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Search className="h-4 w-4 text-primary" />
                    Retrieved answer preview
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-foreground">
                    Customers on annual enterprise plans receive a 30-day assisted cancellation window. Security questionnaires should include RLS isolation, service-role restrictions, and human approval controls.
                  </p>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Sources: Refund policy, SOC2 security packet. Demo only; live retrieval requires configured Supabase pgvector and embedding provider.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "ai" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-primary" />
                  AI Copilot Simulation
                </CardTitle>
                <CardDescription>Ask against the isolated demo state and see how tool results are presented.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <label htmlFor="demo-query" className="text-xs font-semibold">
                    Demo prompt
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="demo-query"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="min-h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button type="button" size="sm" className="gap-1.5">
                      <PlayCircle className="h-3.5 w-3.5" />
                      Simulate
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-muted-foreground">User</p>
                    <p className="mt-2 text-sm">{query}</p>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold text-primary">Copilot</p>
                    <p className="mt-2 text-sm leading-relaxed">
                      I found 2 attention items: Starlight Digital needs a security response, and the AI Copilot pilot deal is nearing close. I can prepare a follow-up task for human approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "approval" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Human Approval Workflow
                </CardTitle>
                <CardDescription>Demo approval changes local UI state only. No API route or database mutation is called.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">Prepared action: create task</p>
                      <p className="text-xs text-muted-foreground">Send revised security questionnaire to Starlight Digital.</p>
                    </div>
                    <Badge variant={approved ? "default" : "outline"}>{approved ? "Approved in demo" : "Pending approval"}</Badge>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                    <Detail label="Tool" value="prepare_create_task" />
                    <Detail label="Executor" value="Human-supervised" />
                    <Detail label="Expiry" value="15 minutes" />
                    <Detail label="Mutation" value="Blocked until approved" />
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => setApproved(true)} disabled={approved}>
                      Approve demo action
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setApproved(false)}>
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs font-semibold">Audit trail preview</p>
                  <div className="mt-3 space-y-3">
                    <Timeline text="AI prepared action with validated payload." done />
                    <Timeline text="Human reviewed preview." done />
                    <Timeline text={approved ? "Demo action marked approved locally." : "Waiting for explicit approval."} done={approved} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
    </div>
  )
}

function Row({ icon, title, meta, badge }: { icon: React.ReactNode; title: string; meta: string; badge: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">{icon}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
        {badge}
      </Badge>
    </div>
  )
}

function Insight({ severity, title, body }: { severity: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>
        <Badge variant="outline" className="text-[10px]">
          {severity}
        </Badge>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function EntityCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: Array<{ title: string; meta: string }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>Search, status, and relationship data in the sample workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Row key={`${title}-${item.title}`} icon={icon} title={item.title} meta={item.meta} badge="Demo" />
        ))}
      </CardContent>
    </Card>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function Timeline({ text, done }: { text: string; done: boolean }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${done ? "text-emerald-600" : "text-muted-foreground"}`} />
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{text}</span>
    </div>
  )
}
