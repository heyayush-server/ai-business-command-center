import React, { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getLeads, getOrganizationMembers } from "@/lib/services/leads.service"
import { leadFilterSchema } from "@/lib/validations/lead.schema"
import { PageHeader } from "@/components/shared/page-header"
import { LeadsFilters } from "@/components/features/leads/leads-filters"
import { LeadsTable } from "@/components/features/leads/leads-table"
import { CreateLeadDialog } from "@/components/features/leads/create-lead-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface LeadsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const rawParams = await searchParams

  const filterParams = leadFilterSchema.parse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    source: typeof rawParams.source === "string" ? rawParams.source : undefined,
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

  const [leadsResult, members] = await Promise.all([
    getLeads(filterParams, currentOrg.organizationId),
    getOrganizationMembers(currentOrg.organizationId),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Management"
        description={`Capture, qualify, and track prospective customer relationships in ${currentOrg.organizationName}.`}
        action={<CreateLeadDialog members={members} />}
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        }
      >
        <LeadsFilters members={members} />

        <LeadsTable
          leads={leadsResult.leads}
          total={leadsResult.total}
          page={leadsResult.page}
          pageSize={leadsResult.pageSize}
          totalPages={leadsResult.totalPages}
          members={members}
        />
      </Suspense>
    </div>
  )
}
