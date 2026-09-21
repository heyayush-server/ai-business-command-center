"use client"

import * as React from "react"
import {
  FileText,
  Database,
  Search,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RAGKnowledgeSection() {
  return (
    <section id="knowledge" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span>Phase 12 RAG Knowledge Base</span>
            </Badge>

            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ground Your AI in Verified Company Truth
            </h2>

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Upload company SOPs, onboarding handbooks, refund policies, and sales playbooks. The AI assistant answers internal questions using high-dimensional semantic vector search over PostgreSQL <code className="font-mono bg-muted px-1 rounded text-xs">pgvector</code>.
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Private Storage &amp; Chunking</h4>
                  <p className="text-muted-foreground">Files (PDF, TXT, MD) are stored in private Supabase Storage buckets with organization-scoped RLS policies.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">PostgreSQL pgvector Embeddings</h4>
                  <p className="text-muted-foreground">Chunks are embedded and matched using cosine similarity directly inside PostgreSQL — no expensive external vector database needed.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Prompt Injection Defense</h4>
                  <p className="text-muted-foreground">Document content is treated as strictly untrusted reference data; instructions in uploaded files cannot trigger unauthorized tool actions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual RAG Pipeline Card */}
          <div className="lg:col-span-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-primary" />
                Semantic Vector Search Pipeline
              </span>
              <Badge variant="outline" className="text-[10px] font-mono text-emerald-600">
                Cosine Similarity &gt; 0.90
              </Badge>
            </div>

            {/* Simulated Query */}
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1 text-xs">
              <span className="text-[10px] text-muted-foreground font-mono">User Query:</span>
              <p className="font-semibold text-foreground">
                &quot;What is our policy for contract discounts exceeding $50,000?&quot;
              </p>
            </div>

            {/* Retrieved Chunk */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-primary font-semibold flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Enterprise_Pricing_Guidelines.pdf (Chunk #3)
                </span>
                <Badge variant="secondary" className="text-[9px] font-mono">Score: 0.942</Badge>
              </div>
              <p className="text-[11px] text-foreground leading-relaxed italic bg-background/80 p-2.5 rounded border border-border/40">
                &quot;Custom contract discounts exceeding 15% or contract values exceeding $50,000 require written sign-off from the VP of Operations before proposal dispatch.&quot;
              </p>
            </div>

            {/* AI Synthesized Answer with Citation */}
            <div className="rounded-lg border border-border bg-background p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Verified Assistant Answer</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                According to your pricing guidelines, contracts exceeding $50,000 require approval from the VP of Operations before presenting to the client.
              </p>
              <span className="text-[10px] font-mono text-primary block pt-1">
                Source: Enterprise_Pricing_Guidelines.pdf
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
