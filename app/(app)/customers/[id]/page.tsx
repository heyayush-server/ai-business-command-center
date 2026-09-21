import React from "react"
import { notFound, redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getCustomerById } from "@/lib/services/customers.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { getEntityActivities } from "@/lib/services/activities.service"
import { CustomerDetailView } from "@/components/features/customers/customer-detail-view"

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
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

  const customer = await getCustomerById(id, currentOrg.organizationId)

  if (!customer) {
    notFound()
  }

  const [members, activities] = await Promise.all([
    getOrganizationMembers(currentOrg.organizationId),
    getEntityActivities(currentOrg.organizationId, "customer", id),
  ])

  return (
    <CustomerDetailView
      customer={customer}
      members={members}
      activities={activities}
    />
  )
}
