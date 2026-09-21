import { describe, it, expect, vi, beforeEach } from "vitest"
import { getDashboardData } from "@/lib/services/dashboard.service"
import * as serverClientModule from "@/lib/supabase/server"
import * as activitiesServiceModule from "@/lib/services/activities.service"

describe("Dashboard Service & Business Intelligence", () => {
  const mockOrgId = "11111111-1111-1111-1111-111111111111"
  const now = new Date()
  const nowIso = now.toISOString()
  const twentyDaysAgoIso = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
  const fortyDaysAgoIso = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString()
  const yesterdayIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const todayIso = now.toISOString().slice(0, 10)
  const inThreeDaysIso = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("throws an error if organization ID is missing", async () => {
    await expect(getDashboardData("")).rejects.toThrow("Organization ID is required")
  })

  it("handles empty organization state safely with zero values and no NaN crashes", async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    vi.spyOn(activitiesServiceModule, "getActivities").mockResolvedValue({
      activities: [],
      total: 0,
      page: 1,
      pageSize: 6,
      totalPages: 0,
    })

    const data = await getDashboardData(mockOrgId)

    // Verify KPIs
    expect(data.kpis.totalLeads).toBe(0)
    expect(data.kpis.recentLeadsCount).toBe(0)
    expect(data.kpis.totalCustomers).toBe(0)
    expect(data.kpis.recentCustomersCount).toBe(0)
    expect(data.kpis.openDealsCount).toBe(0)
    expect(data.kpis.openDealsValue).toBe(0)
    expect(data.kpis.wonDealsCount).toBe(0)
    expect(data.kpis.wonDealsValue).toBe(0)
    expect(data.kpis.totalPipelineValue).toBe(0)
    expect(data.kpis.openTasksCount).toBe(0)
    expect(data.kpis.tasksDueSoonCount).toBe(0)

    // Verify Pipeline
    expect(data.pipeline.totalDeals).toBe(0)
    expect(data.pipeline.totalValue).toBe(0)
    data.pipeline.stages.forEach((stage) => {
      expect(stage.count).toBe(0)
      expect(stage.totalValue).toBe(0)
      expect(stage.percentage).toBe(0)
    })

    // Verify Lead / Customer
    expect(data.leadCustomer.totalLeads).toBe(0)
    expect(data.leadCustomer.totalCustomers).toBe(0)
    expect(data.leadCustomer.convertedLeadsCount).toBe(0)
    expect(data.leadCustomer.conversionRate).toBe(0)
    expect(data.leadCustomer.recentCustomers).toEqual([])

    // Verify Task overview & Priority items
    expect(data.taskOverview.openTasks).toBe(0)
    expect(data.taskOverview.overdueCount).toBe(0)
    expect(data.priorityWork).toEqual([])
    expect(data.recentActivities).toEqual([])
  })

  it("calculates accurate KPI metrics and filters by active organization", async () => {
    const mockLeads = [
      { id: "lead-1", status: "new", created_at: twentyDaysAgoIso },
      { id: "lead-2", status: "qualified", created_at: fortyDaysAgoIso },
      { id: "lead-3", status: "contacted", created_at: nowIso },
    ]

    const mockCustomers = [
      {
        id: "cust-1",
        name: "Acme Corp",
        industry: "Tech",
        created_at: twentyDaysAgoIso,
        converted_from_lead_id: "lead-1",
      },
      {
        id: "cust-2",
        name: "Global Tech",
        industry: "Finance",
        created_at: fortyDaysAgoIso,
        converted_from_lead_id: null,
      },
    ]

    const mockDeals = [
      {
        id: "deal-1",
        title: "Deal Alpha",
        stage: "discovery",
        value: 10000,
        currency: "USD",
        expected_close: inThreeDaysIso,
        created_at: twentyDaysAgoIso,
        updated_at: twentyDaysAgoIso,
      },
      {
        id: "deal-2",
        title: "Deal Beta",
        stage: "proposal",
        value: 25000,
        currency: "USD",
        expected_close: inThreeDaysIso,
        created_at: nowIso,
        updated_at: nowIso,
      },
      {
        id: "deal-3",
        title: "Deal Gamma",
        stage: "closed_won",
        value: 50000,
        currency: "USD",
        expected_close: yesterdayIso,
        created_at: fortyDaysAgoIso,
        updated_at: twentyDaysAgoIso,
      },
      {
        id: "deal-4",
        title: "Deal Delta",
        stage: "closed_lost",
        value: 15000,
        currency: "USD",
        expected_close: yesterdayIso,
        created_at: fortyDaysAgoIso,
        updated_at: fortyDaysAgoIso,
      },
    ]

    const mockTasks = [
      {
        id: "task-1",
        title: "Overdue Followup",
        status: "todo",
        priority: "high",
        due_date: yesterdayIso,
        created_at: nowIso,
        assigned_to: "user-1",
      },
      {
        id: "task-2",
        title: "Meeting Today",
        status: "in_progress",
        priority: "urgent",
        due_date: todayIso,
        created_at: nowIso,
        assigned_to: "user-2",
      },
      {
        id: "task-3",
        title: "Completed Review",
        status: "done",
        priority: "low",
        due_date: yesterdayIso,
        created_at: fortyDaysAgoIso,
        assigned_to: "user-1",
      },
    ]

    const mockRecentActivity = {
      id: "act-1",
      organization_id: mockOrgId,
      action: "deal_created",
      title: "Created Deal Alpha",
      description: "Deal value $10,000",
      actor_type: "user" as const,
      user_id: "user-1",
      entity_type: "deal",
      entity_id: "deal-1",
      details: {},
      created_at: nowIso,
    }

    const mockFrom = vi.fn().mockImplementation((tableName: string) => {
      let dataToReturn: unknown[] = []
      if (tableName === "leads") dataToReturn = mockLeads
      else if (tableName === "customers") dataToReturn = mockCustomers
      else if (tableName === "deals") dataToReturn = mockDeals
      else if (tableName === "tasks") dataToReturn = mockTasks

      const chain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockImplementation((col: string, val: string) => {
          expect(col).toBe("organization_id")
          expect(val).toBe(mockOrgId)
          return chain
        }),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: dataToReturn, error: null }),
        then: vi.fn((resolve) => resolve({ data: dataToReturn, error: null })),
      }
      return chain
    })

    vi.spyOn(serverClientModule, "createClient").mockResolvedValue({
      from: mockFrom,
    } as unknown as never)

    vi.spyOn(activitiesServiceModule, "getActivities").mockResolvedValue({
      activities: [mockRecentActivity as never],
      total: 1,
      page: 1,
      pageSize: 6,
      totalPages: 1,
    })

    const data = await getDashboardData(mockOrgId)

    // 1. KPI Cards
    expect(data.kpis.totalLeads).toBe(3)
    expect(data.kpis.recentLeadsCount).toBe(2) // 20 days ago + now
    expect(data.kpis.totalCustomers).toBe(2)
    expect(data.kpis.recentCustomersCount).toBe(1) // 20 days ago
    expect(data.kpis.openDealsCount).toBe(2) // discovery + proposal
    expect(data.kpis.openDealsValue).toBe(35000) // 10000 + 25000
    expect(data.kpis.wonDealsCount).toBe(1)
    expect(data.kpis.wonDealsValue).toBe(50000)
    expect(data.kpis.recentWonDealsCount).toBe(1) // updated 20 days ago
    expect(data.kpis.totalPipelineValue).toBe(35000)
    expect(data.kpis.openTasksCount).toBe(2) // todo + in_progress
    expect(data.kpis.tasksDueSoonCount).toBe(2) // overdue (yesterday) + due today

    // 2. Sales Pipeline
    expect(data.pipeline.totalDeals).toBe(4)
    expect(data.pipeline.totalValue).toBe(35000)
    const discoveryStage = data.pipeline.stages.find((s) => s.stage === "discovery")
    const proposalStage = data.pipeline.stages.find((s) => s.stage === "proposal")
    const wonStage = data.pipeline.stages.find((s) => s.stage === "closed_won")
    const lostStage = data.pipeline.stages.find((s) => s.stage === "closed_lost")

    expect(discoveryStage?.count).toBe(1)
    expect(discoveryStage?.totalValue).toBe(10000)
    expect(proposalStage?.count).toBe(1)
    expect(proposalStage?.totalValue).toBe(25000)
    expect(wonStage?.count).toBe(1)
    expect(wonStage?.totalValue).toBe(50000)
    expect(lostStage?.count).toBe(1)
    expect(lostStage?.totalValue).toBe(15000)

    // 3. Lead / Customer Conversion
    expect(data.leadCustomer.totalLeads).toBe(3)
    expect(data.leadCustomer.leadsByStatus.new).toBe(1)
    expect(data.leadCustomer.leadsByStatus.qualified).toBe(1)
    expect(data.leadCustomer.leadsByStatus.contacted).toBe(1)
    expect(data.leadCustomer.leadsByStatus.qualifying).toBe(0)
    expect(data.leadCustomer.totalCustomers).toBe(2)
    expect(data.leadCustomer.convertedLeadsCount).toBe(1) // cust-1 converted from lead-1
    expect(data.leadCustomer.conversionRate).toBe(33.3) // 1/3 = 33.3%

    // 4. Task Overview
    expect(data.taskOverview.overdueCount).toBe(1)
    expect(data.taskOverview.dueTodayCount).toBe(1)
    expect(data.taskOverview.openTasks).toBe(2)
    expect(data.taskOverview.completedTasks).toBe(1)
    expect(data.taskOverview.highUrgentOpenCount).toBe(2) // high + urgent

    // 5. Priority Work Queue
    expect(data.priorityWork.length).toBeGreaterThan(0)
    const overdueItem = data.priorityWork.find((p) => p.type === "overdue_task")
    expect(overdueItem).toBeDefined()
    expect(overdueItem?.title).toBe("Overdue Followup")
    expect(overdueItem?.badgeText).toBe("Overdue")

    // 6. Recent Activity
    expect(data.recentActivities.length).toBe(1)
    expect(data.recentActivities[0].action).toBe("deal_created")
  })
})
