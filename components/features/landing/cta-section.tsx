"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-linear-to-b from-background via-primary/5 to-muted/20 border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background px-3.5 py-1 text-xs font-medium text-foreground shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Production-Ready SaaS Engineering Portfolio</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Ready to Experience Autonomous Business Operations?
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          Launch into the live command center to inspect real-time Kanban pipelines, task queues, proactive intelligence feeds, and interactive MCP tool calling.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "lg",
              className: "w-full sm:w-auto gap-2 px-8 text-sm font-semibold shadow-md",
            })}
          >
            <span>Launch Command Center Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "w-full sm:w-auto text-sm font-medium",
            })}
          >
            Sign In with Existing Account
          </Link>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Zero Real Database Writes from Public Demo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Isolated Multi-Tenant Architecture</span>
          </div>
        </div>
      </div>
    </section>
  )
}
