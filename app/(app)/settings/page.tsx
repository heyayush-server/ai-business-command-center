import React from "react"
import { Settings, Sliders, Shield, Key } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings &amp; Configuration"
        description="Manage organization preferences, team memberships, and LLM provider credentials."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Organization &amp; Roles</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Manage members and RBAC (Owner, Admin, Member).
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Multi-tenant organization management scheduled for Phase 1.
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">AI Provider Keys</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configure Anthropic and OpenAI API credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Runtime provider selection and model configuration (Phase 5).
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Audit &amp; Security</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Review RLS enforcement rules and data access.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Strict row-level security and permission controls (Phase 1).
          </CardContent>
        </Card>
      </div>

      <EmptyState
        icon={<Settings className="h-6 w-6" />}
        title="Workspace Administration"
        description="Full organization settings, user role management, and API key management will be activated in subsequent phases."
        actionLabel="Back to Dashboard"
        actionHref="/dashboard"
      />
    </div>
  )
}
