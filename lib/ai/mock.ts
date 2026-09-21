import { createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { getMCPTools } from "@/lib/mcp/server"
import type { MCPContext } from "@/lib/mcp/context"

interface MockChatParams {
  serverContext: MCPContext
  userQuery: string
  onFinish?: (fullText: string) => Promise<void>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => Promise<any>

/**
 * Handles mock AI chat streaming by executing real organization-scoped tools
 * and deterministically synthesizing factual business intelligence.
 *
 * Uses the correct AI SDK 7 UIMessageChunk wire format:
 *   start → start-step → tool-input-start → tool-input-available
 *   → tool-output-available → text-start → text-delta... → text-end
 *   → finish-step → finish
 */
export async function handleMockChat({
  serverContext,
  userQuery,
  onFinish,
}: MockChatParams): Promise<Response> {
  const tools = getMCPTools(serverContext)
  const q = userQuery.toLowerCase()

  let toolName = "get_business_summary"
  let toolArgs: Record<string, unknown> = {}
  let toolResult: unknown = null
  let responseText = ""

  // ── Route write-action queries to prepare tools (return approval cards) ───
  // These route to real prepare tools which call createPendingAction with the
  // real executor — mock mode never bypasses authorization.

  const isWriteQuery =
    (q.includes("create") || q.includes("add") || q.includes("new") || q.includes("make")) ||
    (q.includes("complete") || q.includes("finish") || q.includes("done") || q.includes("mark")) ||
    (q.includes("update") || q.includes("change") || q.includes("modify") || q.includes("edit")) ||
    (q.includes("log") && (q.includes("call") || q.includes("meeting") || q.includes("note") || q.includes("activity")))

  if (isWriteQuery) {
    // Determine which prepare tool to call based on entity keyword
    let prepareToolName: keyof typeof tools | null = null
    let prepareArgs: Record<string, unknown> = {}

    if (q.includes("task") || q.includes("follow") || q.includes("todo")) {
      if (q.includes("complete") || q.includes("finish") || q.includes("done") || q.includes("mark")) {
        // complete_task needs an id — not available in mock, so show create instead
        prepareToolName = "prepare_create_task"
        prepareArgs = {
          title: "Follow-up task",
          priority: "medium",
          due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        }
      } else if (q.includes("update") || q.includes("change") || q.includes("modify")) {
        prepareToolName = "prepare_create_task"
        prepareArgs = {
          title: "Updated task",
          priority: "high",
        }
      } else {
        prepareToolName = "prepare_create_task"
        prepareArgs = {
          title: q.includes("follow") ? "Follow-up task" : "New task from AI",
          priority: "medium",
          due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        }
      }
    } else if (q.includes("lead") || q.includes("prospect")) {
      prepareToolName = "prepare_create_lead"
      prepareArgs = {
        first_name: "New",
        last_name: "Prospect",
        status: "new",
      }
    } else if (q.includes("customer") || q.includes("client")) {
      prepareToolName = "prepare_create_customer"
      prepareArgs = {
        name: "New Customer Account",
        status: "active",
      }
    } else if (q.includes("deal") || q.includes("opportunity")) {
      // For mock, we can't create a deal without a real customer ID
      // Fallback to read-only pipeline view
      prepareToolName = null
    } else if (q.includes("log") || q.includes("activity") || q.includes("note") || q.includes("call") || q.includes("meeting")) {
      prepareToolName = "prepare_record_activity"
      prepareArgs = {
        entity_type: "general",
        action: q.includes("call") ? "call" : q.includes("meeting") ? "meeting" : "note",
        title: q.includes("call") ? "Logged a call" : q.includes("meeting") ? "Meeting recorded" : "Note added",
        description: "Logged via AI Assistant",
      }
    }

    if (prepareToolName && prepareToolName in tools) {
      toolName = prepareToolName
      toolArgs = prepareArgs
      const execute = tools[prepareToolName].execute as unknown as AnyFn
      try {
        toolResult = await execute(prepareArgs)
        if (toolResult && typeof toolResult === "object" && "actionId" in toolResult) {
          responseText = `I've prepared a **${(toolResult as { preview?: { label?: string } }).preview?.label ?? prepareToolName.replace("prepare_", "")}** action for your review. Please approve or cancel it below.`
        } else if (toolResult && typeof toolResult === "object" && "error" in toolResult) {
          responseText = `I couldn't prepare that action: ${(toolResult as { error: string }).error}`
        } else {
          responseText = "The action has been prepared. Please review the details below."
        }
      } catch (err) {
        toolResult = null
        responseText = err instanceof Error
          ? `Couldn't prepare that action: ${err.message}`
          : "An error occurred while preparing the action."
      }

      // Early return with the write-action response
      const callId = `call_mock_${Date.now()}`
      const textId = `text_mock_${Date.now()}`

      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start" })
          writer.write({ type: "start-step" })
          writer.write({ type: "tool-input-start", toolCallId: callId, toolName })
          writer.write({ type: "tool-input-available", toolCallId: callId, toolName, input: toolArgs })
          writer.write({ type: "tool-output-available", toolCallId: callId, output: toolResult })
          writer.write({ type: "text-start", id: textId })
          const words = responseText.split(" ")
          for (let i = 0; i < words.length; i += 4) {
            const chunk = words.slice(i, i + 4).join(" ") + (i + 4 < words.length ? " " : "")
            writer.write({ type: "text-delta", id: textId, delta: chunk })
          }
          writer.write({ type: "text-end", id: textId })
          writer.write({ type: "finish-step" })
          writer.write({ type: "finish", finishReason: "stop" })
          if (onFinish) await onFinish(responseText)
        },
      })

      return createUIMessageStreamResponse({ stream })
    }
  }

  // ── Route query to the most appropriate read-only tool ────────────────────

  if (
    q.includes("attention") ||
    q.includes("insight") ||
    q.includes("briefing") ||
    q.includes("focus") ||
    q.includes("risk") ||
    q.includes("anomal") ||
    q.includes("stuck") ||
    (q.includes("lead") && (q.includes("follow") || q.includes("need"))) ||
    (q.includes("deal") && (q.includes("risk") || q.includes("stale") || q.includes("attention"))) ||
    (q.includes("customer") && q.includes("inactive"))
  ) {
    toolName = "get_business_insights"
    const entityType = q.includes("deal")
      ? "deal"
      : q.includes("lead")
      ? "lead"
      : q.includes("task")
      ? "task"
      : q.includes("customer")
      ? "customer"
      : undefined

    toolArgs = entityType ? { entity_type: entityType } : {}
    const execute = tools.get_business_insights.execute as unknown as AnyFn
    const res = (await execute(toolArgs)) as {
      briefing: {
        headline: string
        summary: string
        keyFindings: string[]
        metrics: {
          totalInsights: number
          criticalCount: number
          warningCount: number
          infoCount: number
          overdueTasksCount: number
          staleLeadsCount: number
          staleDealsCount: number
          inactiveCustomersCount: number
        }
      }
      insights: Array<{
        id: string
        type: string
        severity: string
        title: string
        description: string
        recommendedAction: string | null
      }>
      total: number
    }
    toolResult = res

    if (res.total === 0) {
      responseText = `### ${res.briefing.headline}\n\n${res.briefing.summary}`
    } else {
      responseText =
        `### ${res.briefing.headline}\n\n` +
        `${res.briefing.summary}\n\n` +
        `**Key Priorities & Recommended Actions:**\n` +
        res.insights
          .map(
            (i) =>
              `- **[${i.severity.toUpperCase()}] ${i.title}**\n  ${i.description}${
                i.recommendedAction ? `\n  *Recommended Action:* ${i.recommendedAction}` : ""
              }`
          )
          .join("\n\n")
    }
  } else if (
    q.includes("pipeline") ||
    q.includes("deal") ||
    q.includes("negotiation") ||
    q.includes("proposal")
  ) {
    if (q.includes("negotiation")) {
      toolName = "search_deals"
      toolArgs = { stage: "negotiation" }
      const execute = tools.search_deals.execute as unknown as AnyFn
      const res = await execute(toolArgs) as {
        count: number
        deals: Array<{ title: string; value: number; currency: string; stage: string; expectedClose: string | null }>
      }
      toolResult = res
      if (res.deals.length === 0) {
        responseText = "There are currently **0 deals** in the **Negotiation** stage."
      } else {
        responseText =
          `You have **${res.deals.length} ${res.deals.length === 1 ? "deal" : "deals"}** currently in Negotiation:\n\n` +
          res.deals
            .map(
              (d) =>
                `- **${d.title}**: $${d.value.toLocaleString()} ${d.currency} (Target: ${d.expectedClose || "None set"})`
            )
            .join("\n")
      }
    } else {
      toolName = "get_pipeline"
      toolArgs = {}
      const execute = tools.get_pipeline.execute as unknown as AnyFn
      const res = await execute() as {
        totalPipelineValue: number
        totalDeals: number
        stages: Array<{ label: string; count: number; totalValue: number; percentageOfPipeline: string }>
      }
      toolResult = res
      responseText =
        `Here is your current sales pipeline summary:\n\n` +
        `- **Total Pipeline Value:** $${res.totalPipelineValue.toLocaleString()}\n` +
        `- **Total Deals:** ${res.totalDeals}\n\n` +
        `**Stages Breakdown:**\n` +
        res.stages
          .map(
            (s) =>
              `  - **${s.label}:** ${s.count} deals ($${s.totalValue.toLocaleString()} • ${s.percentageOfPipeline})`
          )
          .join("\n")
    }
  } else if (
    q.includes("task") ||
    q.includes("overdue") ||
    q.includes("due") ||
    q.includes("deadline")
  ) {
    toolName = "get_tasks"
    const dueFilter = q.includes("overdue")
      ? "overdue"
      : q.includes("today")
      ? "today"
      : q.includes("week")
      ? "this_week"
      : undefined

    toolArgs = { due_date_filter: dueFilter }
    const execute = tools.get_tasks.execute as unknown as AnyFn
    const res = await execute(toolArgs) as {
      count: number
      tasks: Array<{ title: string; status: string; priority: string; dueDate: string | null }>
    }
    toolResult = res

    if (res.tasks.length === 0) {
      responseText = dueFilter
        ? `No ${dueFilter.replace("_", " ")} tasks found in your organization. Everything is on track!`
        : "You currently have no open tasks recorded."
    } else {
      const header =
        dueFilter === "overdue"
          ? `You have **${res.tasks.length} overdue ${res.tasks.length === 1 ? "task" : "tasks"}** requiring immediate attention:`
          : dueFilter === "today"
          ? `You have **${res.tasks.length} ${res.tasks.length === 1 ? "task" : "tasks"} due today**:`
          : `Found **${res.tasks.length} operational ${res.tasks.length === 1 ? "task" : "tasks"}**:`

      responseText =
        `${header}\n\n` +
        res.tasks
          .map(
            (t) =>
              `- **${t.title}** [${t.priority.toUpperCase()}] • Status: ${t.status} • Due: ${t.dueDate || "Not set"}`
          )
          .join("\n")
    }
  } else if (q.includes("lead") || q.includes("prospect") || q.includes("qualif")) {
    const status = q.includes("qualified")
      ? "qualified"
      : q.includes("qualifying")
      ? "qualifying"
      : q.includes("contacted")
      ? "contacted"
      : q.includes("new")
      ? "new"
      : undefined

    toolName = "search_leads"
    toolArgs = { status }
    const execute = tools.search_leads.execute as unknown as AnyFn
    const res = await execute(toolArgs) as {
      count: number
      leads: Array<{ name: string; company: string | null; email: string | null; status: string }>
    }
    toolResult = res

    if (res.leads.length === 0) {
      responseText = status
        ? `No leads with status **${status}** found in your organization.`
        : "No matching leads found."
    } else {
      responseText = status
        ? `Here are your leads currently marked as **${status}** (${res.leads.length} found):\n\n`
        : `Here are the latest leads in your database (${res.leads.length} found):\n\n`

      responseText += res.leads
        .map(
          (l) =>
            `- **${l.name}**${l.company ? ` (${l.company})` : ""} • Status: \`${l.status}\`${l.email ? ` • ${l.email}` : ""}`
        )
        .join("\n")
    }
  } else if (
    q.includes("customer") ||
    q.includes("client") ||
    q.includes("account")
  ) {
    toolName = "search_customers"
    toolArgs = {}
    const execute = tools.search_customers.execute as unknown as AnyFn
    const res = await execute(toolArgs) as {
      count: number
      customers: Array<{ name: string; industry: string | null; status: string; contactName: string | null }>
    }
    toolResult = res

    if (res.customers.length === 0) {
      responseText = "No customer accounts have been registered yet."
    } else {
      responseText =
        `Found **${res.customers.length} customer accounts** in your organization:\n\n` +
        res.customers
          .map(
            (c) =>
              `- **${c.name}**${c.industry ? ` (${c.industry})` : ""} • Status: ${c.status}${c.contactName ? ` • Contact: ${c.contactName}` : ""}`
          )
          .join("\n")
    }
  } else if (
    q.includes("activity") ||
    q.includes("audit") ||
    q.includes("history") ||
    q.includes("log")
  ) {
    toolName = "get_recent_activities"
    toolArgs = { limit: 5 }
    const execute = tools.get_recent_activities.execute as unknown as AnyFn
    const res = await execute(toolArgs) as {
      count: number
      activities: Array<{ title: string; action: string; actorName: string; created_at: string }>
    }
    toolResult = res

    if (res.activities.length === 0) {
      responseText = "No recent activities recorded for your organization yet."
    } else {
      responseText =
        `Here is the latest activity stream (${res.activities.length} recent events):\n\n` +
        res.activities
          .map(
            (a) =>
              `- **${a.title}** by ${a.actorName} (\`${a.action}\`) on ${a.created_at.slice(0, 10)}`
          )
          .join("\n")
    }
  } else {
    // Default: Business Overview
    toolName = "get_business_summary"
    toolArgs = {}
    const execute = tools.get_business_summary.execute as unknown as AnyFn
    const res = await execute() as {
      totalLeads: number
      recentLeadsCount: number
      totalCustomers: number
      recentCustomersCount: number
      openDealsCount: number
      openDealsValue: number
      wonDealsCount: number
      wonDealsValue: number
      totalPipelineValue: number
      openTasksCount: number
      tasksDueSoonCount: number
      leadToCustomerConversionRate: string
    }
    toolResult = res

    responseText =
      `Here is the high-level business summary for your organization:\n\n` +
      `- **Total Leads:** ${res.totalLeads} (+${res.recentLeadsCount} in last 30d)\n` +
      `- **Total Customers:** ${res.totalCustomers} (+${res.recentCustomersCount} in last 30d)\n` +
      `- **Lead Conversion Rate:** ${res.leadToCustomerConversionRate}\n` +
      `- **Active Sales Pipeline:** $${res.totalPipelineValue.toLocaleString()} across ${res.openDealsCount} open deals\n` +
      `- **Won Deals:** ${res.wonDealsCount} ($${res.wonDealsValue.toLocaleString()} closed won)\n` +
      `- **Open Tasks:** ${res.openTasksCount} (${res.tasksDueSoonCount} due soon or overdue)\n\n` +
      `You can ask me for more details on any specific deals, leads, tasks, or recent activities!`
  }

  // ── Ensure responseText is never empty (fallback safety) ─────────────────
  if (!responseText.trim()) {
    responseText = "I retrieved your business data but found no matching records to report."
  }

  const callId = `call_mock_${Date.now()}`
  const textId = `text_mock_${Date.now()}`

  // ── Build the correct AI SDK 7 UIMessageChunk stream ─────────────────────
  // Chunk order required by the SDK wire protocol:
  //   start → start-step → tool-input-start → tool-input-available
  //   → tool-output-available → text-start → text-delta(s) → text-end
  //   → finish-step → finish
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Envelope: message start
      writer.write({ type: "start" })
      writer.write({ type: "start-step" })

      // Tool invocation announcement
      writer.write({
        type: "tool-input-start",
        toolCallId: callId,
        toolName,
      })

      // Tool input fully available (no streaming input for mock)
      writer.write({
        type: "tool-input-available",
        toolCallId: callId,
        toolName,
        input: toolArgs,
      })

      // Tool output
      writer.write({
        type: "tool-output-available",
        toolCallId: callId,
        output: toolResult,
      })

      // Text response streaming
      writer.write({
        type: "text-start",
        id: textId,
      })

      // Stream text in small word-group chunks for effect
      const words = responseText.split(" ")
      for (let i = 0; i < words.length; i += 3) {
        const chunk =
          words.slice(i, i + 3).join(" ") + (i + 3 < words.length ? " " : "")
        writer.write({
          type: "text-delta",
          id: textId,
          delta: chunk,
        })
      }

      writer.write({
        type: "text-end",
        id: textId,
      })

      // Envelope: step + message finish
      writer.write({ type: "finish-step" })
      writer.write({ type: "finish", finishReason: "stop" })

      if (onFinish) {
        await onFinish(responseText)
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
