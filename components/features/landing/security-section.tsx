"use client"

import * as React from "react"
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-3 mb-16">
          <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Zero-Trust Architecture</span>
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Security Engineered Directly Into the Database
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Multi-tenancy is not an application-layer filter; it is enforced at the PostgreSQL engine level via Row-Level Security and private schema security definer functions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">PostgreSQL Row-Level Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every query executes under PostgreSQL RLS policies. Even if application code were compromised, tenant records are mathematically isolated at the database layer.
            </p>
            <div className="pt-2 border-t border-border/50 text-[11px] text-foreground font-mono">
              WHERE organization_id = private.current_org_id()
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Zero Client Trust Authority</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Client-supplied organization or user IDs are never trusted. The server derives tenant and role context exclusively from secure HTTP-only cookies and cryptographic JWT sessions.
            </p>
            <div className="pt-2 border-t border-border/50 text-[11px] text-emerald-600 font-mono">
              Server Session Verified • No Spoofing
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Supervised Mutation Staging</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The AI cannot write to database tables without human review. Every state modification generates an ephemeral pending action validated against strict Zod schemas.
            </p>
            <div className="pt-2 border-t border-border/50 text-[11px] text-amber-600 font-mono">
              Two-Phase Commit • 15m Expiry TTL
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
