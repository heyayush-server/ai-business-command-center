import React from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getUser } from "@/lib/auth/getUser"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { AIChatInterface } from "@/components/features/ai/ai-chat-interface"

export default async function AIAssistantPage() {
  const currentOrg = await getCurrentOrganization()
  if (!currentOrg) {
    redirect("/onboarding")
  }

  const user = await getUser()

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Business Assistant"
        description={`Interactive business intelligence and operational command center for ${currentOrg.organizationName}.`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              <span>Human Approval Required</span>
            </Badge>
          </div>
        }
      />

      <AIChatInterface
        organizationName={currentOrg.organizationName}
        userName={user?.email}
      />
    </div>
  )
}
