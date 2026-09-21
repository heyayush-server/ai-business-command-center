import { GoogleGenAI } from "@google/genai"
import { createUIMessageStream, createUIMessageStreamResponse, type UIMessage } from "ai"
import { getMCPTools } from "@/lib/mcp/server"
import type { MCPContext } from "@/lib/mcp/context"
import { buildSystemPrompt } from "@/lib/ai/prompts/system"
import { recordUsageTokens } from "@/lib/services/ai-usage.service"
import { saveAIMessage } from "@/lib/services/ai-conversation.service"

interface GeminiChatParams {
  messages: UIMessage[]
  serverContext: MCPContext
  orgName: string
  userName: string
  conversationRecordId: string
  onFinish?: (fullText: string) => Promise<void>
}

// Function declarations exposed to Gemini runtime
const GEMINI_FUNCTION_DECLARATIONS = [
  {
    name: "get_business_summary",
    description: "Retrieve high-level business intelligence KPIs for the organization: total leads, total customers, open deals, won deals, pipeline value, and open tasks.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "get_proactive_insights",
    description: "Retrieve prioritized proactive AI business intelligence insights and executive recommendations for the organization.",
    parameters: {
      type: "OBJECT",
      properties: {},
    },
  },
  {
    name: "search_leads",
    description: "Search and filter leads in the organization by name, company, email, or status.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search query across lead names, companies, and emails." },
        status: { type: "STRING", description: "Filter by status: new, contacted, qualified, lost, converted." },
        limit: { type: "INTEGER", description: "Maximum number of leads to return (1-20)." },
      },
    },
  },
  {
    name: "prepare_create_lead",
    description: "Prepare an action to create a new lead. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        first_name: { type: "STRING", description: "First name of the lead." },
        last_name: { type: "STRING", description: "Last name of the lead." },
        email: { type: "STRING", description: "Email address of the lead." },
        company: { type: "STRING", description: "Company or business name." },
        title: { type: "STRING", description: "Job title of the lead." },
        phone: { type: "STRING", description: "Phone number." },
        source: { type: "STRING", description: "Lead source (e.g. website, inbound, referral)." },
        notes: { type: "STRING", description: "Notes or context regarding the lead." },
      },
      required: ["first_name", "last_name"],
    },
  },
  {
    name: "prepare_update_lead_status",
    description: "Prepare an action to update a lead's qualification status. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        lead_id: { type: "STRING", description: "ID of the lead to update." },
        status: { type: "STRING", description: "New status: new, contacted, qualified, lost, converted." },
      },
      required: ["lead_id", "status"],
    },
  },
  {
    name: "search_customers",
    description: "Search and filter customers by name, company, industry, or status.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search query across customer names and contacts." },
        status: { type: "STRING", description: "Filter by status: active, churned, inactive." },
        limit: { type: "INTEGER", description: "Maximum number of customers to return (1-20)." },
      },
    },
  },
  {
    name: "search_deals",
    description: "Search and filter sales pipeline deals by name, customer, or stage.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search query across deal names." },
        stage: { type: "STRING", description: "Filter by stage: lead, discovery, proposal, negotiation, won, lost." },
        limit: { type: "INTEGER", description: "Maximum number of deals to return (1-20)." },
      },
    },
  },
  {
    name: "prepare_create_deal",
    description: "Prepare an action to create a sales deal. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Deal name or title." },
        customer_id: { type: "STRING", description: "Customer ID the deal is associated with." },
        value: { type: "NUMBER", description: "Monetary value of the deal in USD." },
        stage: { type: "STRING", description: "Pipeline stage: lead, discovery, proposal, negotiation, won, lost." },
        expected_close_date: { type: "STRING", description: "Expected close date in YYYY-MM-DD format." },
        probability: { type: "NUMBER", description: "Win probability percentage (0-100)." },
      },
      required: ["name", "customer_id", "value"],
    },
  },
  {
    name: "prepare_update_deal_stage",
    description: "Prepare an action to update a deal's sales pipeline stage. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        deal_id: { type: "STRING", description: "ID of the deal to advance or modify." },
        stage: { type: "STRING", description: "New stage: lead, discovery, proposal, negotiation, won, lost." },
      },
      required: ["deal_id", "stage"],
    },
  },
  {
    name: "search_tasks",
    description: "Search tasks in the workspace by query, status, priority, or due date.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search query across task titles." },
        status: { type: "STRING", description: "Filter by status: todo, in_progress, completed, cancelled." },
        priority: { type: "STRING", description: "Filter by priority: low, medium, high, urgent." },
        limit: { type: "INTEGER", description: "Maximum number of tasks to return (1-20)." },
      },
    },
  },
  {
    name: "prepare_create_task",
    description: "Prepare an action to create an operational task. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Task title." },
        description: { type: "STRING", description: "Task description or instructions." },
        due_date: { type: "STRING", description: "Due date in YYYY-MM-DD format." },
        priority: { type: "STRING", description: "Priority: low, medium, high, urgent." },
        entity_type: { type: "STRING", description: "Linked entity type: lead, customer, deal." },
        entity_id: { type: "STRING", description: "Linked entity ID." },
      },
      required: ["title"],
    },
  },
  {
    name: "prepare_complete_task",
    description: "Prepare an action to mark an existing task as completed. Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        task_id: { type: "STRING", description: "ID of the task to complete." },
      },
      required: ["task_id"],
    },
  },
  {
    name: "search_activities",
    description: "Search the organization's audit log and timeline activities.",
    parameters: {
      type: "OBJECT",
      properties: {
        entity_type: { type: "STRING", description: "Filter by entity type: lead, customer, deal, task." },
        entity_id: { type: "STRING", description: "Filter by specific entity ID." },
        activity_type: { type: "STRING", description: "Filter by activity type." },
        limit: { type: "INTEGER", description: "Maximum number of activities to return (1-20)." },
      },
    },
  },
  {
    name: "prepare_log_activity",
    description: "Prepare an action to log a business activity (call, meeting, note). Requires human approval before being executed in the database.",
    parameters: {
      type: "OBJECT",
      properties: {
        entity_type: { type: "STRING", description: "Linked entity type: lead, customer, deal." },
        entity_id: { type: "STRING", description: "Linked entity ID." },
        activity_type: { type: "STRING", description: "Activity type: call, email, meeting, note." },
        title: { type: "STRING", description: "Activity title or subject." },
        description: { type: "STRING", description: "Activity details or summary." },
      },
      required: ["entity_type", "entity_id", "activity_type", "title"],
    },
  },
  {
    name: "search_knowledge_base",
    description: "Search internal company documents, policies, guides, and procedures using semantic similarity.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Semantic search query." },
        threshold: { type: "NUMBER", description: "Similarity threshold (0.0 to 1.0)." },
        matchCount: { type: "INTEGER", description: "Maximum number of document passages to return (1-5)." },
      },
      required: ["query"],
    },
  },
]

/**
 * Executes a Gemini chat request using the official @google/genai SDK.
 * Integrates MCP business tools, enforces human-approval boundaries on write actions,
 * records AI token metrics, and streams the wire protocol consumed by @ai-sdk/react.
 */
export async function handleGeminiChat({
  messages,
  serverContext,
  orgName,
  userName,
  conversationRecordId,
  onFinish,
}: GeminiChatParams): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.")
  }

  const modelId = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const ai = new GoogleGenAI({ apiKey })

  const systemInstruction = buildSystemPrompt({
    orgName,
    userName,
    userRole: serverContext.role,
    today: new Date().toISOString().slice(0, 10),
  })

  // Format historical messages for Gemini
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contents: any[] = []
  for (const m of messages) {
    let text = ""
    if (Array.isArray(m.parts)) {
      text = m.parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(" ")
        .trim()
    }

    if (text) {
      contents.push({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text }],
      })
    }
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.write({ type: "start" })
      writer.write({ type: "start-step" })

      let totalInputTokens = 0
      let totalOutputTokens = 0

      try {
        const tools = getMCPTools(serverContext)

        // 1. Initial generation with tool definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (ai.models as any).generateContent({
          model: modelId,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: GEMINI_FUNCTION_DECLARATIONS }],
          },
        })

        if (response.usageMetadata) {
          totalInputTokens += response.usageMetadata.promptTokenCount || 0
          totalOutputTokens += response.usageMetadata.candidatesTokenCount || 0
        }

        const functionCalls = response.functionCalls

        if (functionCalls && functionCalls.length > 0) {
          // Process function calls sequentially
          const functionResponses: Array<{ functionResponse: { name: string; response: Record<string, unknown> } }> = []

          for (const call of functionCalls) {
            const toolCallId = `call_gemini_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
            const toolName = call.name
            const toolArgs = (call.args || {}) as Record<string, unknown>

            writer.write({
              type: "tool-input-start",
              toolCallId,
              toolName,
            })

            writer.write({
              type: "tool-input-available",
              toolCallId,
              toolName,
              input: toolArgs,
            })

            // Execute MCP tool safely within server context
            let result: unknown = null
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mcpTool = (tools as any)[toolName]
            if (mcpTool && typeof mcpTool.execute === "function") {
              try {
                result = await mcpTool.execute(toolArgs)
              } catch (err: unknown) {
                result = { error: err instanceof Error ? err.message : String(err) }
              }
            } else {
              result = { error: `Tool ${toolName} not found or unsupported.` }
            }

            writer.write({
              type: "tool-output-available",
              toolCallId,
              output: result,
            })

            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: { result },
              },
            })
          }

          // Append assistant function call and user function responses to contents
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const modelParts: any[] = functionCalls.map((fc: any) => ({
            functionCall: { name: fc.name, args: fc.args },
          }))

          contents.push({
            role: "model",
            parts: modelParts,
          })

          contents.push({
            role: "user",
            parts: functionResponses,
          })

          // 2. Call Gemini for final synthesis after tool execution
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const finalResponse = await (ai.models as any).generateContent({
            model: modelId,
            contents,
            config: {
              systemInstruction,
            },
          })

          if (finalResponse.usageMetadata) {
            totalInputTokens += finalResponse.usageMetadata.promptTokenCount || 0
            totalOutputTokens += finalResponse.usageMetadata.candidatesTokenCount || 0
          }

          const finalText = finalResponse.text || "I have processed your request."
          const textId = `text_gemini_${Date.now()}`

          writer.write({ type: "text-start", id: textId })
          writer.write({ type: "text-delta", id: textId, delta: finalText })
          writer.write({ type: "text-end", id: textId })

          // Persist assistant message
          await saveAIMessage({
            conversationId: conversationRecordId,
            role: "assistant",
            content: finalText,
            parts: [{ type: "text", text: finalText }],
            model: modelId,
            tokenCount: totalInputTokens + totalOutputTokens,
          }).catch((err) => console.error("[gemini] Failed to save assistant message:", err))

          if (onFinish) {
            await onFinish(finalText)
          }
        } else {
          // Direct text response without tool invocation
          const text = response.text || "I'm here to assist with your business operations."
          const textId = `text_gemini_${Date.now()}`

          writer.write({ type: "text-start", id: textId })
          writer.write({ type: "text-delta", id: textId, delta: text })
          writer.write({ type: "text-end", id: textId })

          await saveAIMessage({
            conversationId: conversationRecordId,
            role: "assistant",
            content: text,
            parts: [{ type: "text", text }],
            model: modelId,
            tokenCount: totalInputTokens + totalOutputTokens,
          }).catch((err) => console.error("[gemini] Failed to save assistant message:", err))

          if (onFinish) {
            await onFinish(text)
          }
        }

        // Record usage in ai_usage table
        await recordUsageTokens({
          organizationId: serverContext.organizationId,
          userId: serverContext.userId,
          model: modelId,
          provider: "gemini",
          promptTokens: totalInputTokens,
          completionTokens: totalOutputTokens,
        })
      } catch (err: unknown) {
        console.error("[gemini] Runtime error:", err)
        const textId = `text_error_${Date.now()}`
        const errorMsg =
          err instanceof Error && err.message.includes("API_KEY")
            ? "Gemini API key is invalid or missing. Please check your server environment configuration."
            : "Google Gemini encountered an error processing your query. Please try again or switch to mock mode."

        writer.write({ type: "text-start", id: textId })
        writer.write({ type: "text-delta", id: textId, delta: errorMsg })
        writer.write({ type: "text-end", id: textId })
      } finally {
        writer.write({ type: "finish-step" })
        writer.write({ type: "finish" })
      }
    },
  })

  return createUIMessageStreamResponse({ stream })
}
