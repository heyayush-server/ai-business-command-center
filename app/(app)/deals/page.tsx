import React, { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import {
  getDeals,
  getDealsForKanban,
  getCustomerOptions,
} from "@/lib/services/deals.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { dealFilterSchema } from "@/lib/validations/deal.schema"
import { DealsClientView } from "@/components/features/deals/deals-client-view"
import { Skeleton } from "@/components/ui/skeleton"

interface DealsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const rawParams = await searchParams

  const filterParams = dealFilterSchema.parse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    stage: typeof rawParams.stage === "string" ? rawParams.stage : undefined,
    customer_id:
      typeof rawParams.customer_id === "string"
        ? rawParams.customer_id
        : undefined,
    assigned_to:
      typeof rawParams.assigned_to === "string"
        ? rawParams.assigned_to
        : undefined,
    sortBy:
      typeof rawParams.sortBy === "string" ? rawParams.sortBy : undefined,
    sortOrder:
      typeof rawParams.sortOrder === "string" ? rawParams.sortOrder : undefined,
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    includeDeleted: rawParams.includeDeleted,
  })

  const [pipelineData, dealsResult, customers, members] = await Promise.all([
    getDealsForKanban(currentOrg.organizationId, {
      search: filterParams.search,
      customer_id: filterParams.customer_id,
      assigned_to: filterParams.assigned_to,
      includeDeleted: filterParams.includeDeleted,
    }),
    getDeals(filterParams, currentOrg.organizationId),
    getCustomerOptions(currentOrg.organizationId),
    getOrganizationMembers(currentOrg.organizationId),
  ])

  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-96 w-full rounded-md" />
        </div>
      }
    >
      <DealsClientView
        pipelineData={pipelineData}
        dealsResult={dealsResult}
        customers={customers}
        members={members}
      />
    </Suspense>
  )
}
