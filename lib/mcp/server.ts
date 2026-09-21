import type { MCPContext } from "./context"
import { getLeadsTools } from "./tools/leads"
import { getCustomersTools } from "./tools/customers"
import { getDealsTools } from "./tools/deals"
import { getTasksTools } from "./tools/tasks"
import { getActivitiesTools } from "./tools/activities"
import { getKnowledgeTools } from "./tools/knowledge"
import { getDashboardTools } from "./tools/dashboard"
import { getInsightsTools } from "./tools/insights"

/**
 * The MCP Tool Registry.
 * Returns all business tools exposed to the AI, bounded by the trusted server context.
 * 
 * @param context Trusted execution context (org, user, role)
 * @returns An object containing all AI tools
 */
export function getMCPTools(context: MCPContext) {
  return {
    ...getLeadsTools(context),
    ...getCustomersTools(context),
    ...getDealsTools(context),
    ...getTasksTools(context),
    ...getActivitiesTools(context),
    ...getKnowledgeTools(context),
    ...getDashboardTools(context),
    ...getInsightsTools(context),
  }
}
