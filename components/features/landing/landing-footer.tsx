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
              Keep your leads, customers, deals, tasks and business knowledge in one place — and let AI help you understand what needs attention.
            </p>
            <p className="text-[11px] text-muted-foreground pt-1">
              Built with precision for growing organizations.
            </p>
          </div>

          {/* Col 2: Workspace Navigation */}
          <div className="space-y-2.5">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Workspace Modules
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
                  Deals &amp; Revenue Pipeline
                </Link>
              </li>
              <li>
                <Link href="/tasks" className="hover:text-foreground transition-colors">
                  Tasks &amp; To-Dos
                </Link>
              </li>
              <li>
                <Link href="/customers" className="hover:text-foreground transition-colors">
                  Customer Directory
                </Link>
              </li>
              <li>
                <Link href="/ai" className="hover:text-foreground transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Story */}
          <div className="space-y-2.5">
            <span className="font-semibold text-foreground text-xs uppercase tracking-wider block">
              Platform Story
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  What Gets Easier?
                </a>
              </li>
              <li>
                <a href="#product" className="hover:text-foreground transition-colors">
                  One Place for Your Business
                </a>
              </li>
              <li>
                <a href="#ai-assistant" className="hover:text-foreground transition-colors">
                  AI Copilot
                </a>
              </li>
              <li>
                <a href="#knowledge" className="hover:text-foreground transition-colors">
                  Business Knowledge
                </a>
              </li>
              <li>
                <a href="#insights" className="hover:text-foreground transition-colors">
                  Proactive Insights
                </a>
              </li>
              <li>
                <a href="#interactive-demo" className="hover:text-foreground transition-colors">
                  Interactive Live Demo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 AI Business Command Center. All rights reserved.</p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span>Private &amp; Secure</span>
            <span>•</span>
            <span>Human-Approved AI</span>
            <span>•</span>
            <span>Real-Time Business Operations</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
