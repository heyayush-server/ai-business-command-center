import { tool } from "ai"
import { z } from "zod"
import { getDashboardData } from "@/lib/services/dashboard.service"
import type { MCPContext } from "../context"

export function getDashboardTools(context: MCPContext) {
  const { organizationId } = context

  return {
    get_business_summary: tool({
      description: "Retrieve high-level business intelligence KPIs for the organization: total leads, total customers, open deals, won deals, pipeline value, and open tasks.",
      inputSchema: z.object({}),
      execute: async () => {
        const data = await getDashboardData(organizationId)
        return {
          totalLeads: data.kpis.totalLeads,
          recentLeadsCount: data.kpis.recentLeadsCount,
          totalCustomers: data.kpis.totalCustomers,
          recentCustomersCount: data.kpis.recentCustomersCount,
          openDealsCount: data.kpis.openDealsCount,
          openDealsValue: data.kpis.openDealsValue,
          wonDealsCount: data.kpis.wonDealsCount,
          wonDealsValue: data.kpis.wonDealsValue,
          totalPipelineValue: data.kpis.totalPipelineValue,
          openTasksCount: data.kpis.openTasksCount,
          tasksDueSoonCount: data.kpis.tasksDueSoonCount,
          leadToCustomerConversionRate: `${data.leadCustomer.conversionRate}%`,
        }
      },
    }),
  }
}
