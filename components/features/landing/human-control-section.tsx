"use client"

import * as React from "react"
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function HumanControlSection() {
  const [approvedState, setApprovedState] = React.useState<"pending" | "approved" | "rejected">("pending")

  return (
    <section id="human-control" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Human-in-the-Loop AI</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            AI Helps. You Stay in Control.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            AI suggests the action. You approve it before anything changes. Your real customer and deal data is never modified without your permission.
          </p>
        </div>

        {/* 2-Column Trust Workflow Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Visual Process Steps */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">You Ask Your AI Assistant</h4>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    &ldquo;Rahul hasn&apos;t replied to our revised proposal. Can you set up a follow-up task for tomorrow morning?&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">AI Formulates the Work</h4>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    The assistant identifies Rahul&apos;s account, checks the $65,000 deal, and pre-fills a structured task with all details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">Action Paused: &ldquo;Waiting for Approval&rdquo;</h4>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    The AI cannot directly alter your database. The action is held safely in a pending state awaiting your sign-off.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">You Approve — Action Executes</h4>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    One click completes the change, updates your dashboard, and logs the action in your transparent company audit stream.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Approval Card Simulation */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Action Preview Sandbox
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setApprovedState("pending")}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Demo</span>
                </Button>
              </div>

              {/* The Approval Card */}
              <div
                className={`rounded-xl border p-5 space-y-4 transition-all duration-300 ${
                  approvedState === "approved"
                    ? "border-emerald-500/40 bg-emerald-500/5 shadow-md"
                    : approvedState === "rejected"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-primary/30 bg-card shadow-sm"
                }`}
              >
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-muted-foreground uppercase">
                    Action Request
                  </span>
                  <Badge
                    variant={
                      approvedState === "approved"
                        ? "default"
                        : approvedState === "rejected"
                        ? "destructive"
                        : "outline"
                    }
                    className={`text-xs font-mono ${
                      approvedState === "approved"
                        ? "bg-emerald-600 text-white"
                        : approvedState === "pending"
                        ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                        : ""
                    }`}
                  >
                    {approvedState === "approved"
                      ? "Approved & Executed"
                      : approvedState === "rejected"
                      ? "Action Declined"
                      : "Waiting for approval"}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-foreground">
                    Create Task: Follow up on revised enterprise proposal
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                    <div>
                      <span className="font-semibold text-foreground">Contact:</span> Rahul Patel
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Account:</span> TechFlow Solutions
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Due:</span> Tomorrow, 10:00 AM
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">Priority:</span> High Priority
                    </div>
                  </div>
                </div>

                {/* Interactive Action Controls */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {approvedState === "approved"
                      ? "Task created in your Command Center."
                      : approvedState === "rejected"
                      ? "No data was modified."
                      : "Click to simulate approval."}
                  </span>

                  {approvedState === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setApprovedState("rejected")}
                        className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setApprovedState("approved")}
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve Action</span>
                      </Button>
                    </div>
                  )}

                  {approvedState === "approved" && (
                    <Badge variant="outline" className="text-xs text-emerald-600 dark:text-emerald-400 gap-1.5 border-emerald-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Task Scheduled Successfully</span>
                    </Badge>
                  )}

                  {approvedState === "rejected" && (
                    <Badge variant="outline" className="text-xs text-destructive gap-1.5 border-destructive/30">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Declined • Nothing Changed</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
