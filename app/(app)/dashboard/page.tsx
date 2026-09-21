import React from "react"
import { Sparkles, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCards } from "@/components/features/dashboard/metric-cards"
import { SalesPipelineChart } from "@/components/features/dashboard/sales-pipeline-chart"
import { LeadConversionChart } from "@/components/features/dashboard/lead-conversion-chart"
import { RecentActivity } from "@/components/features/dashboard/recent-activity"
import { TasksDueSoon } from "@/components/features/dashboard/tasks-due-soon"
import { AIInsightsPanel } from "@/components/features/dashboard/ai-insights-panel"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Command Center"
        description="Unified real-time metrics, pipeline health, operational tasks, and autonomous AI recommendations."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Feed</span>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate AI Briefing</span>
            </Button>
          </div>
        }
      />

      {/* 5 Core Metric Cards */}
      <MetricCards />

      {/* AI Operational Intelligence Feed */}
      <AIInsightsPanel />

      {/* Visual Analytics & Funnel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesPipelineChart />
        <LeadConversionChart />
      </div>

      {/* Operational Task Queue & Immutable Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksDueSoon />
        <RecentActivity />
      </div>
    </div>
  )
}
