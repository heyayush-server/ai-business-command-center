import React, { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getCustomers } from "@/lib/services/customers.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { customerFilterSchema } from "@/lib/validations/customer.schema"
import { PageHeader } from "@/components/shared/page-header"
import { CustomersFilters } from "@/components/features/customers/customers-filters"
import { CustomersTable } from "@/components/features/customers/customers-table"
import { CreateCustomerDialog } from "@/components/features/customers/create-customer-dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface CustomersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const rawParams = await searchParams

  const filterParams = customerFilterSchema.parse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
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

  const [customersResult, members] = await Promise.all([
    getCustomers(filterParams, currentOrg.organizationId),
    getOrganizationMembers(currentOrg.organizationId),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Accounts"
        description={`Manage active business relationships, client contracts, and account managers for ${currentOrg.organizationName}.`}
        action={<CreateCustomerDialog members={members} />}
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        }
      >
        <CustomersFilters members={members} />

        <CustomersTable
          customers={customersResult.customers}
          total={customersResult.total}
          page={customersResult.page}
          pageSize={customersResult.pageSize}
          totalPages={customersResult.totalPages}
          members={members}
        />
      </Suspense>
    </div>
  )
}
