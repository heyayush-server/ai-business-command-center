import React from "react"
import { notFound, redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import {
  getDealById,
  getCustomerOptions,
} from "@/lib/services/deals.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { getEntityActivities } from "@/lib/services/activities.service"
import { DealDetailView } from "@/components/features/deals/deal-detail-view"

interface DealDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function DealDetailPage({ params }: DealDetailPageProps) {
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

  const deal = await getDealById(id, currentOrg.organizationId)

  if (!deal) {
    notFound()
  }

  const [customers, members, activities] = await Promise.all([
    getCustomerOptions(currentOrg.organizationId),
    getOrganizationMembers(currentOrg.organizationId),
    getEntityActivities(currentOrg.organizationId, "deal", id),
  ])

  return (
    <DealDetailView
      deal={deal}
      customers={customers}
      members={members}
      activities={activities}
    />
  )
}
