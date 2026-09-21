import React from "react"
import { redirect } from "next/navigation"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getDashboardData } from "@/lib/services/dashboard.service"
import { getBusinessInsights } from "@/lib/services/insights.service"
import { getOrganizationMembers } from "@/lib/services/leads.service"
import { getCustomerOptions } from "@/lib/services/deals.service"
import { getTaskEntityOptions } from "@/lib/services/tasks.service"
import { PageHeader } from "@/components/shared/page-header"
import { DashboardQuickActions } from "@/components/features/dashboard/dashboard-quick-actions"
import { MetricCards } from "@/components/features/dashboard/metric-cards"
import { AIInsightsPanel } from "@/components/features/dashboard/ai-insights-panel"
import { SalesPipelineChart } from "@/components/features/dashboard/sales-pipeline-chart"
import { LeadConversionChart } from "@/components/features/dashboard/lead-conversion-chart"
import { RecentActivity } from "@/components/features/dashboard/recent-activity"
import { TasksDueSoon } from "@/components/features/dashboard/tasks-due-soon"
import { PriorityWorkSection } from "@/components/features/dashboard/priority-work-section"

export default async function DashboardPage() {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    redirect("/onboarding")
  }

  // Parallel server fetch of dashboard metrics, proactive insights, and entity options
  const [dashboardData, insightsData, members, customers, entityOptions] = await Promise.all([
    getDashboardData(currentOrg.organizationId),
    getBusinessInsights(currentOrg.organizationId),
    getOrganizationMembers(currentOrg.organizationId),
    getCustomerOptions(currentOrg.organizationId),
    getTaskEntityOptions(currentOrg.organizationId),
  ])

  return (
    <div className="space-y-6">
      {/* Page Header with Quick Actions */}
      <PageHeader
        title="Executive Command Center"
        description={`Real-time business intelligence and operational management for ${currentOrg.organizationName}.`}
        action={
          <DashboardQuickActions
            members={members}
            customers={customers}
            entityOptions={entityOptions}
          />
        }
      />

      {/* 1. KPI Cards */}
      <MetricCards kpis={dashboardData.kpis} />

      {/* 2. Proactive AI Business Intelligence Feed */}
      <AIInsightsPanel
        insights={insightsData.insights}
        briefing={insightsData.briefing}
      />

      {/* 3. Priority & Upcoming Work Queue */}
      <PriorityWorkSection items={dashboardData.priorityWork} />

      {/* 3. Sales Pipeline & Lead/Customer Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesPipelineChart pipeline={dashboardData.pipeline} />
        <LeadConversionChart summary={dashboardData.leadCustomer} />
      </div>

      {/* 4. Operational Task Queue & Immutable Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksDueSoon overview={dashboardData.taskOverview} />
        <RecentActivity activities={dashboardData.recentActivities} />
      </div>
    </div>
  )
}
