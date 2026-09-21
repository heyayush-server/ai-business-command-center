"use client"

import * as React from "react"
import {
  FileText,
  Bot,
  ArrowDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RAGKnowledgeSection() {
  return (
    <section id="knowledge" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Plain-Language Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs gap-1.5 font-medium">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Business Knowledge</span>
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your AI Knows Your Business.
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Ask your business questions. Your AI can search the documents and information you&apos;ve already added — giving you exact answers without digging through files.
            </p>

            {/* 3 Step Visual Sequence */}
            <div className="space-y-4 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Upload Your Documents</h4>
                  <p className="text-muted-foreground mt-0.5">
                    Add your company policies, sales playbooks, price lists, or onboarding guides in PDF or text format.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">AI Finds the Right Information</h4>
                  <p className="text-muted-foreground mt-0.5">
                    When anyone on your team asks a question, the AI reads the relevant sections in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Answers with Verified Sources</h4>
                  <p className="text-muted-foreground mt-0.5">
                    The AI points directly to the document it used, so you always know where the answer came from.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Flow from Document to AI Answer */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-5">
            {/* Step 1: Uploaded Document Card */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Company_Refund_Policy_2026.pdf
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Added by Operations • Active Document
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                  Uploaded &amp; Ready
                </Badge>
              </div>

              <div className="rounded-lg bg-background/80 p-2.5 text-[11px] text-muted-foreground border border-border/50 italic">
                &ldquo;...customers may request a full refund within 30 days of purchase for unused annual licenses upon written confirmation.&rdquo;
              </div>
            </div>

            {/* Visual Arrow Flow */}
            <div className="flex items-center justify-center gap-2 text-primary font-medium text-xs py-0.5">
              <ArrowDown className="h-4 w-4 animate-bounce" />
              <span>AI connects document to your question</span>
            </div>

            {/* Step 2: User Question */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-semibold">
                User Question
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                &ldquo;What is our refund policy for annual licenses?&rdquo;
              </p>
            </div>

            {/* Step 3: AI Answer with Document Source */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Bot className="h-4 w-4 text-primary" />
                  <span>AI Assistant Answer</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  Verified from your documents
                </Badge>
              </div>

              <p className="text-xs text-foreground leading-relaxed">
                According to your uploaded policy document, customers can request a full refund within <strong>30 days of purchase</strong> for unused annual licenses upon written confirmation.
              </p>

              {/* Source Indicator Tag */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-primary font-medium">
                  <FileText className="h-3 w-3" />
                  <span>Source: Company_Refund_Policy_2026.pdf (Section 3.1)</span>
                </div>
                <span className="text-[10px] text-muted-foreground">100% Grounded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
