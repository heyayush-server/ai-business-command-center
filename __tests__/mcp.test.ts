import { describe, it, expect, vi } from "vitest"
import { getMCPTools } from "@/lib/mcp/server"
import type { MCPContext } from "@/lib/mcp/context"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}))

vi.mock("@/lib/services/ai-actions.service", () => ({
  createPendingAction: vi.fn().mockResolvedValue({ id: "123", success: true }),
}))

vi.mock("@/lib/services/insights.service", () => ({
  getBusinessInsights: vi.fn().mockResolvedValue({
    briefing: {
      headline: "1 Critical Item Requiring Immediate Attention",
      summary: "Today you have 1 overdue task.",
      keyFindings: ["Overdue Task: Task 1"],
      metrics: {
        totalInsights: 1,
        criticalCount: 1,
        warningCount: 0,
        infoCount: 0,
        overdueTasksCount: 1,
        staleLeadsCount: 0,
        staleDealsCount: 0,
        inactiveCustomersCount: 0,
      },
      generatedAt: "2026-09-22T00:00:00.000Z",
    },
    insights: [
      {
        id: "ins-1",
        type: "OVERDUE_TASK",
        severity: "critical",
        title: "Overdue Task: Task 1",
        description: "Task is past due.",
        entityType: "task",
        entityId: "task-1",
        recommendedAction: { label: "Complete or reschedule this task" },
        createdAt: "2026-09-22T00:00:00.000Z",
      },
    ],
    total: 1,
  }),
}))

describe("MCP Business Copilot Tools", () => {
  const adminContext: MCPContext = {
    userId: "user-1",
    organizationId: "org-1",
    role: "admin",
    conversationId: "conv-1",
  }

  const viewerContext: MCPContext = {
    userId: "user-2",
    organizationId: "org-1",
    role: "viewer",
    conversationId: "conv-2",
  }

  it("should expose all domain tools", () => {
    const tools = getMCPTools(adminContext)
    
    // Check reads
    expect(tools.get_business_summary).toBeDefined()
    expect(tools.get_business_insights).toBeDefined()
    expect(tools.search_leads).toBeDefined()
    expect(tools.search_customers).toBeDefined()
    expect(tools.search_deals).toBeDefined()
    expect(tools.get_tasks).toBeDefined()
    expect(tools.search_knowledge_base).toBeDefined()

    // Check writes (prepares)
    expect(tools.prepare_create_task).toBeDefined()
    expect(tools.prepare_update_task).toBeDefined()
    expect(tools.prepare_complete_task).toBeDefined()
    expect(tools.prepare_create_lead).toBeDefined()
    expect(tools.prepare_update_deal).toBeDefined()
  })

  it("should allow viewers to read proactive business insights", async () => {
    const tools = getMCPTools(viewerContext)
    expect(tools.get_business_insights).toBeDefined()

    // @ts-expect-error AI tool execute returns dynamic union
    const result = (await tools.get_business_insights.execute({ severity: "all", limit: 10, entity_type: "all" }, {})) as {
      briefing: { headline: string; summary: string }
      insights: Array<{ title: string; severity: string }>
      total: number
    }

    expect(result.briefing.headline).toContain("1 Critical Item")
    expect(result.insights.length).toBe(1)
    expect(result.insights[0].title).toContain("Overdue Task")
  })

  it("should prevent viewers from preparing write actions", async () => {
    const tools = getMCPTools(viewerContext)
    
    // Attempt to prepare a task creation
    // @ts-expect-error AI tool execute returns dynamic union
    const result = (await tools.prepare_create_task.execute({ title: "New Task" }, {})) as { error?: string; success?: boolean }
    
    expect(result.error).toContain("Insufficient permissions: viewer accounts cannot prepare write actions")
  })

  it("should allow admins to prepare write actions", async () => {
    const tools = getMCPTools(adminContext)
    
    // Attempt to prepare a task creation
    // @ts-expect-error AI tool execute returns dynamic union
    const result = (await tools.prepare_create_task.execute({ title: "New Task" }, {})) as { error?: string; success?: boolean }
    
    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
  })
})
