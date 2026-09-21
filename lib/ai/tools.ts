import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getDashboardData } from "@/lib/services/dashboard.service"
import { validateEntityBelongsToOrg, getActivities } from "@/lib/services/activities.service"
import type { LeadStatus, DealStage, TaskStatus, TaskPriority } from "@/lib/types/database.types"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import { searchKnowledge } from "@/lib/services/knowledge.service"

export interface AIServerContext {
  organizationId: string
  userId: string
  userRole: string
  conversationId?: string | null
}

/**
 * Factory creating all organization-scoped, read-only AI business tools.
 * Injects serverContext into the closure — organizationId is NEVER supplied or trusted from the LLM or client.
 */
export function getAITools(serverContext: AIServerContext) {
  const { organizationId } = serverContext

  return {
    get_business_summary: tool({
      description:
        "Retrieve high-level business intelligence KPIs for the organization: total leads, total customers, open deals, won deals, pipeline value, and open tasks.",
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

    search_knowledge_base: tool({
      description: "Search the organization's uploaded knowledge base documents (e.g. SOPs, policies, guides) to answer company-specific questions.",
      inputSchema: z.object({
        query: z.string().describe("The semantic search query based on the user's question."),
        limit: z.number().int().min(1).max(10).default(5).describe("Maximum number of relevant document chunks to return."),
      }),
      execute: async ({ query, limit }) => {
        try {
          const results = await searchKnowledge(organizationId, query, limit)
          if (!results || results.length === 0) {
            return { results: [], message: "No relevant company knowledge found." }
          }
          return {
            results: results.map((r: any) => ({
              content: r.content,
              metadata: r.metadata,
              similarity: r.similarity
            }))
          }
        } catch (error: any) {
          console.error("[getAITools:search_knowledge_base] Error:", error)
          return { error: "Failed to search knowledge base" }
        }
      },
    }),

    search_leads: tool({
      description:
        "Search and filter leads by text query (name, email, company) and/or lead status.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search term for first name, last name, email, or company"),
        status: z
          .enum(["new", "contacted", "qualifying", "qualified", "lost"])
          .optional()
          .describe("Filter by lead status"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of leads to return (max 50)"),
      }),
      execute: async ({ query, status, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("leads")
          .select("id, first_name, last_name, email, company, status, source, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (status) {
          q = q.eq("status", status as LeadStatus)
        }

        if (query && query.length > 0) {
          const term = `%${query}%`
          q = q.or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},company.ilike.${term}`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[getAITools:search_leads] Error:", error)
          return { error: "Failed to search leads", leads: [] }
        }

        return {
          count: data.length,
          leads: data.map((l) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name}`.trim(),
            email: l.email,
            company: l.company,
            status: l.status,
            source: l.source,
            created_at: l.created_at.slice(0, 10),
          })),
        }
      },
    }),

    get_leads: tool({
      description: "List leads optionally filtered by status.",
      inputSchema: z.object({
        status: z
          .enum(["new", "contacted", "qualifying", "qualified", "lost"])
          .optional()
          .describe("Filter by status"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum leads to retrieve"),
      }),
      execute: async ({ status, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("leads")
          .select("id, first_name, last_name, email, company, status, source, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (status) {
          q = q.eq("status", status as LeadStatus)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[getAITools:get_leads] Error:", error)
          return { error: "Failed to retrieve leads", leads: [] }
        }

        return {
          count: data.length,
          leads: data.map((l) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name}`.trim(),
            email: l.email,
            company: l.company,
            status: l.status,
            source: l.source,
            created_at: l.created_at.slice(0, 10),
          })),
        }
      },
    }),

    search_customers: tool({
      description: "Search customer accounts by name, primary contact name, email, or industry.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search term for customer name, contact name, email, or industry"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum customers to retrieve"),
      }),
      execute: async ({ query, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("customers")
          .select("id, name, industry, status, primary_contact_name, primary_contact_email, converted_from_lead_id, created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (query && query.length > 0) {
          const term = `%${query}%`
          q = q.or(`name.ilike.${term},primary_contact_name.ilike.${term},primary_contact_email.ilike.${term},industry.ilike.${term}`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[getAITools:search_customers] Error:", error)
          return { error: "Failed to search customers", customers: [] }
        }

        return {
          count: data.length,
          customers: data.map((c) => ({
            id: c.id,
            name: c.name,
            industry: c.industry,
            status: c.status,
            contactName: c.primary_contact_name,
            contactEmail: c.primary_contact_email,
            convertedFromLead: Boolean(c.converted_from_lead_id),
            created_at: c.created_at.slice(0, 10),
          })),
        }
      },
    }),

    search_deals: tool({
      description: "Search and filter deals by title and/or sales stage.",
      inputSchema: z.object({
        query: z.string().trim().optional().describe("Search text for deal title"),
        stage: z
          .enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"])
          .optional()
          .describe("Filter by deal stage"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum deals to retrieve"),
      }),
      execute: async ({ query, stage, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("deals")
          .select("id, title, stage, value, currency, expected_close, customer:customers(id, name), created_at")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (stage) {
          q = q.eq("stage", stage as DealStage)
        }

        if (query && query.length > 0) {
          q = q.ilike("title", `%${query}%`)
        }

        const { data, error } = await q.order("created_at", { ascending: false }).limit(limit)

        if (error) {
          console.error("[getAITools:search_deals] Error:", error)
          return { error: "Failed to search deals", deals: [] }
        }

        return {
          count: data.length,
          deals: data.map((d) => {
            const cust = Array.isArray(d.customer) ? d.customer[0] : d.customer
            return {
              id: d.id,
              title: d.title,
              stage: d.stage,
              value: Number(d.value) || 0,
              currency: d.currency || "USD",
              customerName: cust?.name || null,
              expectedClose: d.expected_close ? d.expected_close.slice(0, 10) : null,
              created_at: d.created_at.slice(0, 10),
            }
          }),
        }
      },
    }),

    get_pipeline: tool({
      description: "Get the complete sales pipeline breakdown by stage: deal volume, stage total value, and active pipeline value.",
      inputSchema: z.object({}),
      execute: async () => {
        const data = await getDashboardData(organizationId)
        return {
          totalPipelineValue: data.pipeline.totalValue,
          totalDeals: data.pipeline.totalDeals,
          stages: data.pipeline.stages.map((s) => ({
            stage: s.stage,
            label: s.label,
            count: s.count,
            totalValue: s.totalValue,
            percentageOfPipeline: `${s.percentage}%`,
          })),
        }
      },
    }),

    get_tasks: tool({
      description: "Retrieve operational tasks filtered by status, priority, or deadline filter (overdue, today, this_week).",
      inputSchema: z.object({
        status: z
          .enum(["todo", "in_progress", "done", "cancelled"])
          .optional()
          .describe("Filter by task status"),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .optional()
          .describe("Filter by task priority"),
        due_date_filter: z
          .enum(["overdue", "today", "this_week", "all"])
          .optional()
          .describe("Deadline filter"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum tasks to retrieve"),
      }),
      execute: async ({ status, priority, due_date_filter, limit }) => {
        const supabase = await createClient()
        let q = supabase
          .from("tasks")
          .select("id, title, status, priority, due_date, created_at, lead_id, customer_id, deal_id")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)

        if (status) {
          q = q.eq("status", status as TaskStatus)
        }
        if (priority) {
          q = q.eq("priority", priority as TaskPriority)
        }

        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)

        if (due_date_filter === "overdue") {
          q = q.lt("due_date", todayStr).in("status", ["todo", "in_progress"])
        } else if (due_date_filter === "today") {
          q = q.eq("due_date", todayStr)
        } else if (due_date_filter === "this_week") {
          const sevenDaysStr = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
          q = q.gte("due_date", todayStr).lte("due_date", sevenDaysStr)
        }

        const { data, error } = await q.order("due_date", { ascending: true, nullsFirst: false }).limit(limit)

        if (error) {
          console.error("[getAITools:get_tasks] Error:", error)
          return { error: "Failed to retrieve tasks", tasks: [] }
        }

        return {
          count: data.length,
          tasks: data.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date ? t.due_date.slice(0, 10) : null,
            created_at: t.created_at.slice(0, 10),
          })),
        }
      },
    }),

    get_recent_activities: tool({
      description: "Retrieve audit activity timeline logs, optionally filtered by entity type or a specific entity ID.",
      inputSchema: z.object({
        entity_type: z
          .enum(["lead", "customer", "deal", "task", "organization", "general"])
          .optional()
          .describe("Filter by entity type"),
        entity_id: z.string().uuid().optional().describe("UUID of specific entity"),
        limit: z.number().int().min(1).max(50).default(10).describe("Maximum activity events to retrieve"),
      }),
      execute: async ({ entity_type, entity_id, limit }) => {
        // Enforce entity tenant ownership before querying if entity_id is specified
        if (entity_id && entity_type && entity_type !== "organization" && entity_type !== "general") {
          const isValid = await validateEntityBelongsToOrg(entity_type, entity_id, organizationId)
          if (!isValid) {
            return {
              error: `Specified ${entity_type} not found or does not belong to your organization`,
              activities: [],
            }
          }
        }

        const res = await getActivities(
          {
            entity_type,
            pageSize: limit,
          },
          organizationId
        )

        let filtered = res.activities
        if (entity_id) {
          filtered = filtered.filter((a) => a.entity_id === entity_id)
        }

        return {
          count: filtered.length,
          activities: filtered.slice(0, limit).map((a) => ({
            id: a.id,
            action: a.action,
            title: a.title,
            description: a.description,
            actorType: a.actor_type,
            actorName:
              a.actor_type === "ai"
                ? "AI Assistant"
                : a.actor?.full_name || a.actor?.email || "Team Member",
            linkedEntity: a.linked_entity
              ? { name: a.linked_entity.name, type: a.linked_entity.type }
              : null,
            created_at: a.created_at,
          })),
        }
      },
    }),

    // ── Phase 11: Prepare tools (write actions requiring human approval) ──

    prepare_create_task: tool({
      description:
        "Prepare a Create Task action for human approval. Does NOT create the task immediately. Returns an approval card. Use when the user asks to create, add, or schedule a task.",
      inputSchema: z.object({
        title: z.string().trim().min(1).max(200).describe("Task title"),
        description: z.string().trim().max(5000).optional().describe("Optional description"),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium").describe("Priority"),
        due_date: z.string().optional().describe("Due date as YYYY-MM-DD string"),
        assigned_to: z.string().uuid().optional().describe("Assignee user ID (resolve via member lookup)"),
        lead_id: z.string().uuid().optional().describe("Optional linked lead ID"),
        customer_id: z.string().uuid().optional().describe("Optional linked customer ID"),
        deal_id: z.string().uuid().optional().describe("Optional linked deal ID"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions: viewer accounts cannot prepare write actions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "create_task",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_complete_task: tool({
      description:
        "Prepare a Complete Task action for human approval. Does NOT mark the task done immediately. Use when the user asks to complete, finish, or close a task.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The task ID to mark as complete"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        // Verify task belongs to org
        const supabase = await createClient()
        const { data: task } = await supabase
          .from("tasks")
          .select("id, title")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!task) return { error: "Task not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "complete_task",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_task: tool({
      description:
        "Prepare an Update Task action for human approval. Does NOT update the task immediately. Use when the user asks to modify, change, or update a task.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The task ID to update"),
        title: z.string().trim().max(200).optional().describe("New title"),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional().describe("New status"),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("New priority"),
        due_date: z.string().optional().describe("New due date YYYY-MM-DD"),
        description: z.string().trim().max(5000).optional().describe("New description"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: task } = await supabase
          .from("tasks")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!task) return { error: "Task not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "update_task",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_create_lead: tool({
      description:
        "Prepare a Create Lead action for human approval. Does NOT create the lead immediately. Use when the user asks to add, create, or register a new lead/prospect.",
      inputSchema: z.object({
        first_name: z.string().trim().min(1).max(100).describe("Lead first name"),
        last_name: z.string().trim().min(1).max(100).describe("Lead last name"),
        email: z.string().email().optional().describe("Email address"),
        company: z.string().trim().max(200).optional().describe("Company name"),
        phone: z.string().trim().max(30).optional().describe("Phone number"),
        source: z.string().trim().max(100).optional().describe("Lead source"),
        status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).optional().default("new").describe("Initial status"),
        notes: z.string().trim().max(5000).optional().describe("Initial notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "create_lead",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_lead: tool({
      description:
        "Prepare an Update Lead action for human approval. Does NOT update the lead immediately. Use when the user asks to change a lead's status, details, or assignment.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The lead ID to update"),
        first_name: z.string().trim().max(100).optional(),
        last_name: z.string().trim().max(100).optional(),
        email: z.string().email().optional(),
        company: z.string().trim().max(200).optional(),
        status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: lead } = await supabase
          .from("leads")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!lead) return { error: "Lead not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "update_lead",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_create_customer: tool({
      description:
        "Prepare a Create Customer action for human approval. Does NOT create the customer immediately. Use when the user asks to add a new customer or client account.",
      inputSchema: z.object({
        name: z.string().trim().min(1).max(200).describe("Customer/company name"),
        industry: z.string().trim().max(100).optional().describe("Industry"),
        primary_contact_name: z.string().trim().max(200).optional().describe("Primary contact person"),
        primary_contact_email: z.string().email().optional().describe("Contact email"),
        primary_contact_phone: z.string().trim().max(30).optional().describe("Contact phone"),
        notes: z.string().trim().max(5000).optional().describe("Notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "create_customer",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_customer: tool({
      description:
        "Prepare an Update Customer action for human approval. Does NOT update the customer immediately.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The customer ID to update"),
        name: z.string().trim().max(200).optional(),
        industry: z.string().trim().max(100).optional(),
        status: z.enum(["active", "inactive", "churned"]).optional(),
        primary_contact_name: z.string().trim().max(200).optional(),
        primary_contact_email: z.string().email().optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: cust } = await supabase
          .from("customers")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!cust) return { error: "Customer not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "update_customer",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_create_deal: tool({
      description:
        "Prepare a Create Deal action for human approval. Does NOT create the deal immediately. Requires a customer_id. Use when the user asks to add a new deal or opportunity.",
      inputSchema: z.object({
        title: z.string().trim().min(1).max(200).describe("Deal title"),
        customer_id: z.string().uuid().describe("The customer this deal belongs to"),
        stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).optional().default("discovery").describe("Initial stage"),
        value: z.number().min(0).optional().default(0).describe("Deal value in the given currency"),
        currency: z.string().length(3).optional().default("USD").describe("3-letter currency code"),
        expected_close: z.string().optional().describe("Expected close date YYYY-MM-DD"),
        notes: z.string().trim().max(5000).optional().describe("Notes"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        // Verify customer belongs to org before creating the pending action
        const supabase = await createClient()
        const { data: cust } = await supabase
          .from("customers")
          .select("id")
          .eq("id", input.customer_id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!cust) return { error: "Customer not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "create_deal",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_update_deal: tool({
      description:
        "Prepare an Update Deal action for human approval. Does NOT update the deal immediately. Use when the user asks to change a deal's stage, value, or details.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The deal ID to update"),
        title: z.string().trim().max(200).optional(),
        stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
        value: z.number().min(0).optional(),
        currency: z.string().length(3).optional(),
        expected_close: z.string().optional(),
        notes: z.string().trim().max(5000).optional(),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        const supabase = await createClient()
        const { data: deal } = await supabase
          .from("deals")
          .select("id")
          .eq("id", input.id)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .maybeSingle()
        if (!deal) return { error: "Deal not found in your organization." }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "update_deal",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),

    prepare_record_activity: tool({
      description:
        "Prepare a Record Activity action for human approval. Does NOT log the activity immediately. Use when the user asks to log a call, note, meeting, or custom event.",
      inputSchema: z.object({
        entity_type: z.enum(["lead", "customer", "deal", "task", "general"]).describe("The type of entity this activity relates to"),
        entity_id: z.string().uuid().optional().describe("Optional ID of the specific entity"),
        action: z.string().trim().min(1).max(100).describe("Action verb, e.g. 'call', 'meeting', 'note'"),
        title: z.string().trim().min(1).max(200).describe("Short descriptive title of the activity"),
        description: z.string().trim().max(5000).optional().describe("Detailed description"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(serverContext.userRole)) {
          return { error: "Insufficient permissions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId: serverContext.userId,
            conversationId: serverContext.conversationId ?? null,
            actionType: "record_activity",
            payload: input,
          })
          return result
        } catch (err) {
          return { error: err instanceof Error ? err.message : "Failed to prepare action" }
        }
      },
    }),
  }
}
