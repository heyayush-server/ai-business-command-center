import Link from "next/link"
import {
  ArrowRight,
  Bot,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  TrendingUp,
  Workflow,
  ChevronRight,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-foreground leading-tight">
                AI Business Command Center
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
                Operations & Intelligence
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Platform
            </a>
            <a href="#ai-engine" className="hover:text-foreground transition-colors">
              AI Assistant
            </a>
            <a href="#security" className="hover:text-foreground transition-colors">
              Security & RLS
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm", className: "text-sm font-medium hidden sm:inline-flex" })}
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className={buttonVariants({ size: "sm", className: "gap-2 shadow-xs font-medium" })}
            >
              <span>Launch App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-6 shadow-2xs">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Next.js 16 + Supabase + Vercel AI SDK
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight">
                Turn business data into decisions and actions.
              </h1>

              <p className="mt-6 text-lg text-muted-foreground sm:text-xl text-balance leading-relaxed">
                A unified operational command center combining leads, customer accounts, deal pipelines, task orchestration, and auditable AI execution into one seamless SaaS platform.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className={buttonVariants({ size: "lg", className: "w-full sm:w-auto gap-2 px-7 text-base shadow-xs" })}
                >
                  <span>Enter Command Center</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className={buttonVariants({ size: "lg", variant: "outline", className: "w-full sm:w-auto text-base" })}
                >
                  Explore Capabilities
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>PostgreSQL RLS Multi-Tenancy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Human-in-the-Loop AI Tools</span>
                </div>
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Immutable Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Product Mockup Preview */}
            <div className="mt-14 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-border" />
                  <div className="h-3 w-3 rounded-full bg-border" />
                  <div className="h-3 w-3 rounded-full bg-border" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    app.commandcenter.internal/dashboard
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono font-medium">
                  DEMO WORKSPACE
                </Badge>
              </div>

              <div className="p-6 md:p-8 bg-muted/10 space-y-6">
                {/* Mock Metrics Header */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-lg border border-border bg-background p-4 shadow-2xs">
                    <span className="text-xs font-medium text-muted-foreground">Total Pipeline</span>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">$128,450</p>
                    <span className="text-xs text-emerald-600 font-medium">↑ 14.2% vs last month</span>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 shadow-2xs">
                    <span className="text-xs font-medium text-muted-foreground">Active Leads</span>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">42</p>
                    <span className="text-xs text-muted-foreground">12 require follow-up</span>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 shadow-2xs">
                    <span className="text-xs font-medium text-muted-foreground">Customers</span>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">89</p>
                    <span className="text-xs text-emerald-600 font-medium">98.4% retention</span>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4 shadow-2xs">
                    <span className="text-xs font-medium text-muted-foreground">AI Tool Approvals</span>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">2 Pending</p>
                    <span className="text-xs text-amber-600 font-medium">Requires supervisor action</span>
                  </div>
                </div>

                {/* Mock AI Action Callout inside Preview */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-foreground">AI Intelligence Agent: Action Proposed</h4>
                      <p className="text-xs text-muted-foreground">
                        Drafted follow-up deal terms for &quot;Acme Corp Expansion&quot; ($34,000). Awaiting one-click approval.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <span className="text-[11px] font-mono text-muted-foreground">ID: act_92a4</span>
                    <Badge variant="outline" className="text-xs bg-background">Inspect &amp; Approve</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="border-t border-border bg-muted/20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3">Comprehensive Business Suite</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Every operational lever under one command.
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Say goodbye to fragmented SaaS silos. Seamlessly connect prospect ingestion, deal progression, task delegation, and execution logs.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Leads &amp; Customer Accounts</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Track prospect lifecycles from initial contact to enterprise account conversion. Complete historical context preserved in one place.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Pipeline &amp; Deal Management</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Visual pipeline stages with weighted deal probabilities, expected close dates, and automatic stage-gate validation.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Task Orchestration</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Assign, prioritize, and track business tasks linked directly to deals and customers. Clear deadlines with priority scoring.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">AI-Powered Operations</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Execute intelligent queries, summarize customer portfolios, draft follow-ups, and automate data entry with tool-calling precision.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Auditable Security &amp; RLS</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Multi-tenant data isolation enforced by PostgreSQL Row-Level Security policies. Every AI action requires human authorization.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-background shadow-2xs hover:shadow-xs transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Real-Time Business Insights</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Actionable analytics on conversion velocity, team workloads, deal slippage, and operational bottleneck detection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section id="ai-engine" className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="outline" className="gap-1.5 py-1">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Vercel AI SDK 7.0 Engine
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Autonomous AI tools with human supervisory guardrails.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Unlike chat-only assistants that sit in isolation, the Command Center AI interacts directly with your PostgreSQL database through typed, Zod-validated tool contracts.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-semibold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Safe Read Queries</h4>
                      <p className="text-xs text-muted-foreground">Immediate, read-only analytics execution for portfolio queries and reports.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 font-semibold text-xs shrink-0 mt-0.5">
                      !
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Server-Gated Write Approvals</h4>
                      <p className="text-xs text-muted-foreground">
                        Mutations (creating deals, reassigning leads, altering states) are staged into <code className="font-mono bg-muted px-1 py-0.5 rounded text-[11px]">ai_pending_actions</code> and execute only upon human signature.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs shrink-0 mt-0.5">
                      ★
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Configurable LLM Models</h4>
                      <p className="text-xs text-muted-foreground">
                        Swap between Anthropic Claude and OpenAI flagship models seamlessly via runtime environment configuration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: "outline", className: "gap-2" })}
                  >
                    <span>View Live Workspace Demo</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Code / Visual Box */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm font-mono text-xs space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3 text-muted-foreground">
                  <span>AI Tool Execution Workflow</span>
                  <Badge variant="secondary" className="text-[10px]">Zero Hallucinated Writes</Badge>
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <p className="text-foreground font-semibold">{"// 1. User prompts assistant"}</p>
                  <p className="text-muted-foreground/80">&quot;Move Acme Corp to Negotiation and schedule a prep task for tomorrow.&quot;</p>
                  <p className="text-foreground font-semibold pt-2">{"// 2. Agent invokes typed tool schema"}</p>
                  <p className="text-emerald-700 bg-emerald-500/10 p-2 rounded">
                    updateDealStage({`{ deal_id: "dl_98a", stage: "negotiation", confidence: 0.9 }`})
                  </p>
                  <p className="text-foreground font-semibold pt-2">{"// 3. Pending Action Staged"}</p>
                  <p className="text-amber-700 bg-amber-500/10 p-2 rounded">
                    INSERT INTO ai_pending_actions: status = &apos;pending_approval&apos;
                  </p>
                  <p className="text-foreground font-semibold pt-2">{"// 4. Human approves in UI"}</p>
                  <p className="text-blue-700 bg-blue-500/10 p-2 rounded">
                    POST /api/ai/actions/approve → DB Transaction Committed + Audited
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & RLS Section */}
        <section id="security" className="border-t border-border bg-muted/20 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <Badge variant="secondary" className="mb-3">Enterprise Grade Foundation</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Security engineered into the schema, not as an afterthought.
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Data isolation is mathematically guaranteed at the database engine level via PostgreSQL Row-Level Security.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3 rounded-xl border border-border bg-background p-6 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">PostgreSQL RLS Multi-Tenancy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every business table is keyed by <code className="text-xs bg-muted px-1 py-0.5 rounded">organization_id</code>. Helper functions in a private schema guarantee cross-tenant leakage is impossible.
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background p-6 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Role-Based Access Control</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Structured permissions for Owner, Admin, and Member roles. Organization memberships govern all reading, editing, and execution capabilities.
                </p>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-background p-6 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Zero Anon Permissions</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Explicit REVOKE policies ensure unauthenticated anonymous requests cannot query or mutate business tables under any circumstances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-24 border-t border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Experience the Future of Autonomous Business Operations
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-2xl mx-auto">
              Explore the clean UI shell, interactive metric dashboards, and architectural layout built on Next.js 16.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className={buttonVariants({ size: "lg", className: "gap-2 px-8 shadow-xs" })}
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight text-foreground">
              AI Business Command Center
            </span>
            <span className="text-xs text-muted-foreground">
              — Portfolio &amp; Engineering Learning Project
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Phase 0 Foundation • Next.js 16 • Tailwind CSS • shadcn/ui • TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}
