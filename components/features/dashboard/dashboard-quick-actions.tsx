"use client"

import React from "react"
import { CreateLeadDialog } from "@/components/features/leads/create-lead-dialog"
import { CreateCustomerDialog } from "@/components/features/customers/create-customer-dialog"
import { CreateDealDialog } from "@/components/features/deals/create-deal-dialog"
import { CreateTaskDialog } from "@/components/features/tasks/create-task-dialog"
import { CreateActivityDialog } from "@/components/features/activities/create-activity-dialog"
import type { OrganizationMemberOption } from "@/lib/services/leads.service"
import type { TaskEntityOptions } from "@/lib/services/tasks.service"

interface DashboardQuickActionsProps {
  members: OrganizationMemberOption[]
  customers: Array<{ id: string; name: string; contact?: string | null }>
  entityOptions: TaskEntityOptions
}

export function DashboardQuickActions({
  members,
  customers,
  entityOptions,
}: DashboardQuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CreateLeadDialog members={members} />
      <CreateCustomerDialog members={members} />
      <CreateDealDialog customers={customers} members={members} />
      <CreateTaskDialog entityOptions={entityOptions} members={members} />
      <CreateActivityDialog defaultEntityType="organization" />
    </div>
  )
}
