import React, { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getActivities } from "@/lib/services/activities.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { activityFilterSchema } from "@/lib/validations/activity.schema"
import { ActivitiesClientView } from "@/components/features/activities/activities-client-view"
import { Skeleton } from "@/components/ui/skeleton"

interface ActivitiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ActivitiesPage({ searchParams }: ActivitiesPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const rawParams = await searchParams

  const filterParams = activityFilterSchema.parse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    action: typeof rawParams.action === "string" ? rawParams.action : undefined,
    entity_type:
      typeof rawParams.entity_type === "string"
        ? rawParams.entity_type
        : undefined,
    user_id:
      typeof rawParams.user_id === "string" ? rawParams.user_id : undefined,
    date_filter:
      typeof rawParams.date_filter === "string"
        ? rawParams.date_filter
        : undefined,
    page: rawParams.page,
    pageSize: rawParams.pageSize,
  })

  const [activitiesResult, members] = await Promise.all([
    getActivities(filterParams, currentOrg.organizationId),
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
      <ActivitiesClientView
        activitiesResult={activitiesResult}
        members={members}
      />
    </Suspense>
  )
}
