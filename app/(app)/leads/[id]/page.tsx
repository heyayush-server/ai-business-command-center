import React from "react"
import { notFound, redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getLeadById, getOrganizationMembers } from "@/lib/services/leads.service"
import { getEntityActivities } from "@/lib/services/activities.service"
import { LeadDetailView } from "@/components/features/leads/lead-detail-view"

interface LeadDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const { id } = await params

  // UUID validation check
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const lead = await getLeadById(id, currentOrg.organizationId)

  if (!lead) {
    notFound()
  }

  const [members, activities] = await Promise.all([
    getOrganizationMembers(currentOrg.organizationId),
    getEntityActivities(currentOrg.organizationId, "lead", id),
  ])

  return (
    <LeadDetailView
      lead={lead}
      members={members}
      activities={activities}
    />
  )
}
