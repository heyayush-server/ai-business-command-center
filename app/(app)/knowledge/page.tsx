import { Metadata } from "next"
import { getDocuments } from "@/lib/services/knowledge.service"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { KnowledgeClient } from "./knowledge-client"

export const metadata: Metadata = {
  title: "Knowledge Base | AI Business Command Center",
  description: "Manage your organization's knowledge documents.",
}

export default async function KnowledgePage() {
  const organization = await getCurrentOrganization()

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <p className="text-muted-foreground">Please select an organization to view knowledge documents.</p>
      </div>
    )
  }

  const documents = await getDocuments(organization.organizationId)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
      </div>
      
      <p className="text-muted-foreground">
        Upload SOPs, policies, and product guides. The AI Assistant will use these to answer organization-specific questions.
      </p>
      
      <KnowledgeClient initialDocuments={documents} />
    </div>
  )
}
