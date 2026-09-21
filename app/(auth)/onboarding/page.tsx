"use client"

import * as React from "react"
import { Building2, ArrowRight, Loader2, AlertCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createInitialOrganization, type AuthActionResult } from "@/lib/actions/auth"

export default function OnboardingPage() {
  const [state, formAction, isPending] = React.useActionState(
    createInitialOrganization,
    null as AuthActionResult | null
  )

  return (
    <Card className="border-border bg-card shadow-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
          <Building2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Setup your workspace</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Deploy an isolated multi-tenant organization. You will be assigned as the Workspace Owner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state?.error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue="Ishan Sharma"
              placeholder="e.g. Ishan Sharma"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization / Company Name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              defaultValue="Acme Global Operations"
              placeholder="e.g. Acme Global Operations"
              required
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              A secure workspace with PostgreSQL Row-Level Security will be provisioned.
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Owner Permissions Provisioning</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your account will be designated as the Organization Owner with full administrative, audit, and tool execution governance.
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full gap-2 mt-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Provisioning Workspace...</span>
              </>
            ) : (
              <>
                <span>Launch Command Center</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
