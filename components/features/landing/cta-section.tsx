"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Play } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-linear-to-b from-background via-primary/5 to-muted/20 border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background px-4 py-1 text-xs font-medium text-foreground shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>One Intelligent Workspace</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground text-balance">
          Ready to Bring Your Business Into One Command Center?
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
          Stop switching between disconnected tools. Manage your leads, customers, deals, tasks, and business knowledge in one place — with an AI assistant that keeps you in control.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "lg",
              className: "w-full sm:w-auto gap-2 px-8 text-sm font-semibold shadow-md",
            })}
          >
            <span>Explore the Command Center</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#interactive-demo"
            className={buttonVariants({
              size: "lg",
              variant: "outline",
              className: "w-full sm:w-auto gap-2 text-sm font-medium",
            })}
          >
            <Play className="h-3.5 w-3.5 text-primary fill-primary/20" />
            <span>Try the Live Demo</span>
          </a>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Private &amp; Secure Workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Human Approval Before Any Change</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>No Complex Setup Required</span>
          </div>
        </div>
      </div>
    </section>
  )
}
