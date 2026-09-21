"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/60 py-12 text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-foreground">
                AI Business Command Center
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              An enterprise operations command center and autonomous AI Copilot. Combines customer lifecycles, deal pipelines, tasks, pgvector RAG, and proactive business intelligence into a secure multi-tenant workspace.
            </p>
            <p className="text-[11px] text-muted-foreground pt-1">
              Engineering portfolio project by Ishan Sharma.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Application Modules
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                  Executive Dashboard
                </Link>
              </li>
              <li>
                <Link href="/leads" className="hover:text-foreground transition-colors">
                  Leads &amp; Qualification
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-foreground transition-colors">
                  Deals &amp; Kanban Pipeline
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-foreground transition-colors">
                  Tasks &amp; SLA Reminders
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-foreground transition-colors">
                  Customer Accounts
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-foreground transition-colors">
                  AI Copilot Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Docs */}
          <div className="space-y-2.5">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Architecture &amp; Docs
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#interactive-demo" className="hover:text-foreground transition-colors">
                  Interactive Live Sandbox
                </a>
              </li>
              <li>
                <a href="#insights" className="hover:text-foreground transition-colors">
                  Proactive Insights Engine
                </a>
              </li>
              <li>
                <a href="#knowledge" className="hover:text-foreground transition-colors">
                  RAG Vector Knowledge
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-foreground transition-colors">
                  PostgreSQL Row-Level Security
                </a>
              </li>
              <li>
                <a
                  href="/docs/insights.md"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Insights Architecture Spec
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 AI Business Command Center. All completed phases verified (Phases 0–14).</p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Next.js 16</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>Supabase RLS</span>
            <span>•</span>
            <span>Vercel AI SDK 7.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
