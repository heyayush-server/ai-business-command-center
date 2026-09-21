import { tool } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createPendingAction } from "@/lib/services/ai-actions.service"
import type { TaskStatus, TaskPriority } from "@/lib/types/database.types"
import type { MCPContext } from "../context"

export function getTasksTools(context: MCPContext) {
  const { organizationId, userId, role, conversationId } = context

  return {
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
          console.error("[MCP:get_tasks] Error:", error)
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

    prepare_create_task: tool({
      description: "Prepare a Create Task action for human approval. Does NOT create the task immediately. Returns an approval card. Use when the user asks to create, add, or schedule a task.",
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
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions: viewer accounts cannot prepare write actions." }
        }
        try {
          const result = await createPendingAction({
            organizationId,
            userId,
            conversationId: conversationId ?? null,
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
      description: "Prepare a Complete Task action for human approval. Does NOT mark the task done immediately. Use when the user asks to complete, finish, or close a task.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The task ID to mark as complete"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
          return { error: "Insufficient permissions." }
        }
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
            userId,
            conversationId: conversationId ?? null,
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
      description: "Prepare an Update Task action for human approval. Does NOT update the task immediately. Use when the user asks to modify, change, or update a task.",
      inputSchema: z.object({
        id: z.string().uuid().describe("The task ID to update"),
        title: z.string().trim().max(200).optional().describe("New title"),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional().describe("New status"),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("New priority"),
        due_date: z.string().optional().describe("New due date YYYY-MM-DD"),
        description: z.string().trim().max(5000).optional().describe("New description"),
      }),
      execute: async (input) => {
        if (!(["owner", "admin", "member"] as string[]).includes(role)) {
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
            userId,
            conversationId: conversationId ?? null,
            actionType: "update_task",
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
