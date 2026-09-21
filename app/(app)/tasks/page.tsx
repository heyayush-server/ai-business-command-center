import React, { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import {
  getTasks,
  getTaskEntityOptions,
} from "@/lib/services/tasks.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { taskFilterSchema } from "@/lib/validations/task.schema"
import { TasksClientView } from "@/components/features/tasks/tasks-client-view"
import { Skeleton } from "@/components/ui/skeleton"

interface TasksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  const rawParams = await searchParams

  const filterParams = taskFilterSchema.parse({
    search: typeof rawParams.search === "string" ? rawParams.search : undefined,
    status: typeof rawParams.status === "string" ? rawParams.status : undefined,
    priority: typeof rawParams.priority === "string" ? rawParams.priority : undefined,
    assigned_to:
      typeof rawParams.assigned_to === "string"
        ? rawParams.assigned_to
        : undefined,
    due_date_filter:
      typeof rawParams.due_date_filter === "string"
        ? rawParams.due_date_filter
        : undefined,
    sortBy:
      typeof rawParams.sortBy === "string" ? rawParams.sortBy : undefined,
    sortOrder:
      typeof rawParams.sortOrder === "string" ? rawParams.sortOrder : undefined,
    page: rawParams.page,
    pageSize: rawParams.pageSize,
    includeDeleted: rawParams.includeDeleted,
  })

  const [tasksResult, entityOptions, members] = await Promise.all([
    getTasks(filterParams, currentOrg.organizationId),
    getTaskEntityOptions(currentOrg.organizationId),
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
      <TasksClientView
        tasksResult={tasksResult}
        entityOptions={entityOptions}
        members={members}
      />
    </Suspense>
  )
}
