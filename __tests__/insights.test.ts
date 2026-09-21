import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getBusinessInsights,
  generateBusinessBriefing,
  clearInsightsCache,
} from "@/lib/services/insights.service"
import { INSIGHT_TYPES, type BusinessInsight } from "@/lib/types/insights"
import * as serverClientModule from "@/lib/supabase/server"

describe("Phase 14: AI Business Intelligence & Proactive Insights Service", () => {
  const mockOrgId = "11111111-1111-1111-1111-111111111111"
  const otherOrgId = "22222222-2222-2222-2222-222222222222"

  const now = new Date()
  const nowIso = now.toISOString()
  const todayStr = nowIso.slice(0, 10)
  const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const fourDaysAgoStr = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const tenDaysAheadStr = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const eightDaysAgoIso = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const sixteenDaysAgoIso = new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000).toISOString()
  const twentyFiveDaysAgoIso = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
  const thirtyFiveDaysAgoIso = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
  const sixtyFiveDaysAgoIso = new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000).toISOString()

  beforeEach(() => {
    vi.restoreAllMocks()
    clearInsightsCache()
  })

  it("throws an error if organization ID is missing", async () => {
    await expect(getBusinessInsights("")).rejects.toThrow(
      "Organization ID is required to generate business insights"
    )
  })

  it("handles empty organization state safely with zero insights and zero hallucinations", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    expect(result.insights).toEqual([])
    expect(result.total).toBe(0)
    expect(result.briefing.headline).toBe("All Operations On Track")
    expect(result.briefing.metrics.totalInsights).toBe(0)
    expect(result.briefing.metrics.criticalCount).toBe(0)
    expect(result.briefing.metrics.warningCount).toBe(0)
    expect(result.briefing.metrics.overdueTasksCount).toBe(0)
    expect(result.briefing.metrics.staleLeadsCount).toBe(0)
    expect(result.briefing.metrics.staleDealsCount).toBe(0)
    expect(result.briefing.metrics.inactiveCustomersCount).toBe(0)
  })

  it("enforces strict organization isolation and filters soft-deleted records", async () => {
    const queriedFilters: Array<{ column: string; value: unknown }> = []
    const softDeleteFilters: Array<{ column: string; value: unknown }> = []

    const mockFrom = vi.fn().mockImplementation(() => {
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((col: string, val: unknown) => {
          queriedFilters.push({ column: col, value: val })
          return chain
        }),
        is: vi.fn().mockImplementation((col: string, val: unknown) => {
          softDeleteFilters.push({ column: col, value: val })
          return chain
        }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    await getBusinessInsights(mockOrgId, { skipCache: true })

    // Verify all queries filtered by organization_id = mockOrgId
    const orgFilters = queriedFilters.filter((f) => f.column === "organization_id")
    expect(orgFilters.length).toBeGreaterThanOrEqual(4) // tasks, leads, deals, customers, activities
    orgFilters.forEach((f) => {
      expect(f.value).toBe(mockOrgId)
      expect(f.value).not.toBe(otherOrgId)
    })

    // Verify soft delete filter was applied
    const deletedAtFilters = softDeleteFilters.filter((f) => f.column === "deleted_at")
    expect(deletedAtFilters.length).toBeGreaterThanOrEqual(4) // tasks, leads, deals, customers
    deletedAtFilters.forEach((f) => {
      expect(f.value).toBe(null)
    })
  })

  it("detects overdue tasks with correct severity assignment", async () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "Urgent overdue task",
        status: "todo",
        priority: "urgent",
        due_date: yesterdayStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-1",
      },
      {
        id: "task-2",
        title: "Normal overdue task",
        status: "in_progress",
        priority: "medium",
        due_date: yesterdayStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-2",
      },
      {
        id: "task-3",
        title: "Severe overdue task (>3d)",
        status: "todo",
        priority: "low",
        due_date: fourDaysAgoStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-3",
      },
      {
        id: "task-4",
        title: "Completed overdue task",
        status: "done",
        priority: "high",
        due_date: yesterdayStr,
        created_at: sixteenDaysAgoIso,
        updated_at: nowIso,
        assigned_to: "user-1",
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "tasks") data = mockTasks
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const overdueInsights = result.insights.filter((i) => i.type === INSIGHT_TYPES.OVERDUE_TASK)
    expect(overdueInsights.length).toBe(3) // task-1, task-2, task-3 (task-4 is done so excluded)

    const urgentInsight = overdueInsights.find((i) => i.entityId === "task-1")
    const normalInsight = overdueInsights.find((i) => i.entityId === "task-2")
    const severeInsight = overdueInsights.find((i) => i.entityId === "task-3")

    expect(urgentInsight?.severity).toBe("critical")
    expect(normalInsight?.severity).toBe("warning")
    expect(severeInsight?.severity).toBe("critical")

    expect(urgentInsight?.entityType).toBe("task")
    expect(urgentInsight?.recommendedAction?.label).toContain("Complete or reschedule")
  })

  it("detects upcoming high and urgent tasks due soon", async () => {
    const mockTasks = [
      {
        id: "task-upcoming-1",
        title: "Urgent task due today",
        status: "todo",
        priority: "urgent",
        due_date: todayStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-1",
      },
      {
        id: "task-upcoming-2",
        title: "High priority task due tomorrow",
        status: "in_progress",
        priority: "high",
        due_date: tomorrowStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-2",
      },
      {
        id: "task-upcoming-3",
        title: "Low priority task due tomorrow",
        status: "todo",
        priority: "low",
        due_date: tomorrowStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
        assigned_to: "user-3",
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "tasks") data = mockTasks
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const upcomingInsights = result.insights.filter((i) => i.type === INSIGHT_TYPES.UPCOMING_TASK)
    expect(upcomingInsights.length).toBe(2) // task-upcoming-1, task-upcoming-2 (low priority excluded)
    expect(upcomingInsights.find((i) => i.entityId === "task-upcoming-1")?.severity).toBe("warning")
    expect(upcomingInsights.find((i) => i.entityId === "task-upcoming-2")?.severity).toBe("info")
  })

  it("detects stale leads and qualifying leads with contact gaps", async () => {
    const mockLeads = [
      {
        id: "lead-stale-1",
        first_name: "Alice",
        last_name: "Smith",
        company: "Acme Corp",
        email: "alice@acme.com",
        status: "new",
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
      },
      {
        id: "lead-active-gap",
        first_name: "Bob",
        last_name: "Jones",
        company: "Beta LLC",
        email: "bob@beta.com",
        status: "qualifying",
        created_at: eightDaysAgoIso,
        updated_at: eightDaysAgoIso,
      },
      {
        id: "lead-lost",
        first_name: "Charlie",
        last_name: "Brown",
        company: "Charlie Co",
        email: "charlie@charlie.com",
        status: "lost",
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "leads") data = mockLeads
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const staleLead = result.insights.find((i) => i.type === INSIGHT_TYPES.STALE_LEAD)
    expect(staleLead).toBeDefined()
    expect(staleLead?.entityId).toBe("lead-stale-1")
    expect(staleLead?.title).toContain("Alice Smith")
    expect(staleLead?.severity).toBe("warning")

    const leadGap = result.insights.find((i) => i.type === INSIGHT_TYPES.HIGH_PRIORITY_LEAD_INACTIVE)
    expect(leadGap).toBeDefined()
    expect(leadGap?.entityId).toBe("lead-active-gap")
    expect(leadGap?.title).toContain("Bob Jones")

    // Lost lead should never be flagged as stale
    expect(result.insights.find((i) => i.entityId === "lead-lost")).toBeUndefined()
  })

  it("detects stale deals, deals closing soon, and past expected close dates", async () => {
    const mockDeals = [
      {
        id: "deal-stale-discovery",
        title: "Major Cloud Migration",
        value: 45000,
        currency: "USD",
        stage: "discovery",
        probability: 30,
        expected_close: tenDaysAheadStr,
        created_at: twentyFiveDaysAgoIso,
        updated_at: twentyFiveDaysAgoIso,
      },
      {
        id: "deal-close-past",
        title: "Overdue Close Deal",
        value: 15000,
        currency: "USD",
        stage: "proposal",
        probability: 60,
        expected_close: yesterdayStr,
        created_at: sixteenDaysAgoIso,
        updated_at: sixteenDaysAgoIso,
      },
      {
        id: "deal-closing-soon",
        title: "Imminent Close Deal",
        value: 12000,
        currency: "USD",
        stage: "negotiation",
        probability: 80,
        expected_close: tomorrowStr,
        created_at: sixteenDaysAgoIso,
        updated_at: nowIso,
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "deals") data = mockDeals
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const staleDeal = result.insights.find((i) => i.type === INSIGHT_TYPES.STALE_DEAL)
    expect(staleDeal).toBeDefined()
    expect(staleDeal?.entityId).toBe("deal-stale-discovery")
    // High-value deal ($45k) should be critical severity
    expect(staleDeal?.severity).toBe("critical")

    const pastCloseDeal = result.insights.find((i) => i.id === "ins-deal-closing-past-deal-close-past")
    expect(pastCloseDeal).toBeDefined()
    expect(pastCloseDeal?.severity).toBe("critical")

    const closingSoonDeal = result.insights.find((i) => i.id === "ins-deal-closing-soon-deal-closing-soon")
    expect(closingSoonDeal).toBeDefined()
    expect(closingSoonDeal?.severity).toBe("warning")
  })

  it("detects inactive customer accounts and assigns appropriate severity", async () => {
    const mockCustomers = [
      {
        id: "cust-35d",
        name: "Inactive Tech Co",
        industry: "Software",
        status: "active",
        created_at: thirtyFiveDaysAgoIso,
        updated_at: thirtyFiveDaysAgoIso,
        converted_from_lead_id: null,
      },
      {
        id: "cust-65d",
        name: "Severely Inactive Logistics",
        industry: "Logistics",
        status: "active",
        created_at: sixtyFiveDaysAgoIso,
        updated_at: sixtyFiveDaysAgoIso,
        converted_from_lead_id: null,
      },
      {
        id: "cust-churned",
        name: "Already Churned Ltd",
        industry: "Retail",
        status: "churned",
        created_at: sixtyFiveDaysAgoIso,
        updated_at: sixtyFiveDaysAgoIso,
        converted_from_lead_id: null,
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "customers") data = mockCustomers
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const customerInsights = result.insights.filter((i) => i.type === INSIGHT_TYPES.INACTIVE_CUSTOMER)
    expect(customerInsights.length).toBe(2)

    const cust35 = customerInsights.find((i) => i.entityId === "cust-35d")
    const cust65 = customerInsights.find((i) => i.entityId === "cust-65d")

    expect(cust35?.severity).toBe("info")
    expect(cust65?.severity).toBe("warning")
    // Churned customer should not generate inactive customer insight
    expect(customerInsights.find((i) => i.entityId === "cust-churned")).toBeUndefined()
  })

  it("detects pipeline concentration risk when a single deal represents >= 40% of pipeline", async () => {
    const mockDeals = [
      {
        id: "deal-giant",
        title: "Enterprise Deal",
        value: 80000,
        currency: "USD",
        stage: "proposal",
        probability: 50,
        expected_close: tenDaysAheadStr,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: "deal-small",
        title: "Starter Deal",
        value: 20000,
        currency: "USD",
        stage: "discovery",
        probability: 30,
        expected_close: tenDaysAheadStr,
        created_at: nowIso,
        updated_at: nowIso,
      },
    ]

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let data: unknown[] = []
      if (tableName === "deals") data = mockDeals
      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data, error: null }),
        then: vi.fn((resolve) => resolve({ data, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    const result = await getBusinessInsights(mockOrgId, { skipCache: true })

    const concentrationInsight = result.insights.find((i) => i.type === INSIGHT_TYPES.PIPELINE_RISK)
    expect(concentrationInsight).toBeDefined()
    expect(concentrationInsight?.entityType).toBe("pipeline")
    expect(concentrationInsight?.entityId).toBe("deal-giant")
    expect(concentrationInsight?.title).toContain("80%")
  })

  it("generates a truthful, hallucination-free executive business briefing", () => {
    const sampleInsights: BusinessInsight[] = [
      {
        id: "ins-1",
        type: INSIGHT_TYPES.OVERDUE_TASK,
        severity: "critical",
        title: "Overdue Task 1",
        description: "Task is 2 days overdue",
        entityType: "task",
        entityId: "t-1",
        createdAt: nowIso,
      },
      {
        id: "ins-2",
        type: INSIGHT_TYPES.OVERDUE_TASK,
        severity: "warning",
        title: "Overdue Task 2",
        description: "Task is 1 day overdue",
        entityType: "task",
        entityId: "t-2",
        createdAt: nowIso,
      },
      {
        id: "ins-3",
        type: INSIGHT_TYPES.STALE_LEAD,
        severity: "warning",
        title: "Stale Lead 1",
        description: "Lead untouched for 15 days",
        entityType: "lead",
        entityId: "l-1",
        createdAt: nowIso,
      },
      {
        id: "ins-4",
        type: INSIGHT_TYPES.INACTIVE_CUSTOMER,
        severity: "info",
        title: "Inactive Customer 1",
        description: "No activity for 40 days",
        entityType: "customer",
        entityId: "c-1",
        createdAt: nowIso,
      },
    ]

    const briefing = generateBusinessBriefing(sampleInsights)

    expect(briefing.metrics.totalInsights).toBe(4)
    expect(briefing.metrics.criticalCount).toBe(1)
    expect(briefing.metrics.warningCount).toBe(2)
    expect(briefing.metrics.infoCount).toBe(1)
    expect(briefing.metrics.overdueTasksCount).toBe(2)
    expect(briefing.metrics.staleLeadsCount).toBe(1)
    expect(briefing.metrics.staleDealsCount).toBe(0)
    expect(briefing.metrics.inactiveCustomersCount).toBe(1)

    // Headline accurately mentions critical item
    expect(briefing.headline).toContain("1 Critical Item")
    // Summary accurately contains the real counts
    expect(briefing.summary).toContain("2 overdue tasks")
    expect(briefing.summary).toContain("1 stale lead")
    expect(briefing.summary).toContain("1 inactive customer account")
  })
})
