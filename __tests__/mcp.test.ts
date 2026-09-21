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

  it("should prevent viewers from preparing write actions", async () => {
    const tools = getMCPTools(viewerContext)
    
    // Attempt to prepare a task creation
    // @ts-expect-error AI tool execute returns dynamic union
    const result = (await tools.prepare_create_task.execute({ title: "New Task" }, {}))
    
    expect(result.error).toContain("Insufficient permissions: viewer accounts cannot prepare write actions")
  })

  it("should allow admins to prepare write actions", async () => {
    const tools = getMCPTools(adminContext)
    
    // Attempt to prepare a task creation
    // @ts-expect-error AI tool execute returns dynamic union
    const result = (await tools.prepare_create_task.execute({ title: "New Task" }, {}))
    
    expect(result.error).toBeUndefined()
    expect(result.success).toBe(true)
  })
})
