import { streamText, convertToModelMessages, isStepCount, type UIMessage } from "ai"
import { getUser } from "@/lib/auth/getUser"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getMCPTools } from "@/lib/mcp/server"
import type { MCPContext } from "@/lib/mcp/context"
import { getAIModel, getModelId, isAIMockMode } from "@/lib/ai/provider"
import { buildSystemPrompt } from "@/lib/ai/prompts/system"
import { handleMockChat } from "@/lib/ai/mock"
import { checkUsageLimit, recordUsageTokens } from "@/lib/services/ai-usage.service"
import { getOrCreateConversation, saveAIMessage } from "@/lib/services/ai-conversation.service"

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized: Please sign in." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 2. Validate current organization context
    const currentOrg = await getCurrentOrganization()
    if (!currentOrg) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Active organization context required." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      )
    }

    // 3. Check daily AI usage quota
    const quota = await checkUsageLimit(currentOrg.organizationId, user.id)
    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: `Daily AI usage limit (${quota.limit} requests) reached. Please try again tomorrow.`,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      )
    }

    // 4. Parse and validate incoming payload
    let body: { messages?: UIMessage[]; conversationId?: string }
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON request body." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { messages = [], conversationId } = body
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "At least one message is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Sanity check message size and count to prevent abuse
    if (messages.length > 50) {
      return new Response(JSON.stringify({ error: "Message history exceeds maximum limit (50)." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Extract text from the last user message
    // In AI SDK 7, UIMessage has `parts` (no top-level `content` field)
    const lastMsg = messages[messages.length - 1]
    const lastUserText = extractTextFromMessage(lastMsg)

    if (lastUserText.length > 2000) {
      return new Response(JSON.stringify({ error: "Message exceeds maximum character length (2000)." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // 5. Server-injected trusted security context
    const mcpContext: MCPContext = {
      organizationId: currentOrg.organizationId,
      userId: user.id,
      role: currentOrg.userRole,
      conversationId,
    }

    // 6. Manage conversation record
    const conv = await getOrCreateConversation(
      currentOrg.organizationId,
      user.id,
      conversationId,
      lastUserText.slice(0, 50) || "Business Operations Briefing"
    )

    // Save user message to database
    if (lastMsg.role === "user") {
      await saveAIMessage({
        conversationId: conv.id,
        role: "user",
        content: lastUserText,
        parts: lastMsg.parts ?? [{ type: "text", text: lastUserText }],
      }).catch((err) => console.error("[api/ai/chat] Failed to save user message:", err))
    }

    // 7. Mock mode execution (AI_MODE=mock or missing provider keys)
    if (isAIMockMode()) {
      return await handleMockChat({
        serverContext: mcpContext,
        userQuery: lastUserText,
        onFinish: async (fullText) => {
          await saveAIMessage({
            conversationId: conv.id,
            role: "assistant",
            content: fullText,
            parts: [{ type: "text", text: fullText }],
            model: "mock-business-assistant",
          }).catch((err) => console.error("[api/ai/chat] Failed to save assistant message:", err))

          await recordUsageTokens({
            organizationId: currentOrg.organizationId,
            userId: user.id,
            model: "mock-business-assistant",
            provider: "mock",
            promptTokens: Math.round(lastUserText.length / 4),
            completionTokens: Math.round(fullText.length / 4),
          })
        },
      })
    }

    // 8. Live mode execution with AI SDK 7
    const modelMessages = await convertToModelMessages(messages)
    const model = getAIModel()
    const modelId = getModelId()

    const result = streamText({
      model,
      system: buildSystemPrompt({
        orgName: currentOrg.organizationName,
        userName: user.email,
        userRole: currentOrg.userRole,
        today: new Date().toISOString().slice(0, 10),
      }),
      messages: modelMessages,
      tools: getMCPTools(mcpContext),
      stopWhen: isStepCount(5),
      onFinish: async ({ text, usage }) => {
        if (text) {
          await saveAIMessage({
            conversationId: conv.id,
            role: "assistant",
            content: text,
            parts: [{ type: "text", text }],
            model: modelId,
            // AI SDK 7 uses inputTokens/outputTokens/totalTokens
            tokenCount: usage.totalTokens ?? 0,
          }).catch((err) => console.error("[api/ai/chat] Failed to save assistant message:", err))
        }

        await recordUsageTokens({
          organizationId: currentOrg.organizationId,
          userId: user.id,
          model: modelId,
          provider: process.env.AI_PROVIDER || "anthropic",
          // AI SDK 7: inputTokens / outputTokens (not promptTokens / completionTokens)
          promptTokens: usage.inputTokens ?? 0,
          completionTokens: usage.outputTokens ?? 0,
        })
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (err: unknown) {
    console.error("[api/ai/chat] Unhandled error:", err)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred with the AI assistant. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

/**
 * Extracts plain text from a UIMessage using its parts array.
 * In AI SDK 7, UIMessage has no top-level `content` string field.
 */
function extractTextFromMessage(msg: UIMessage): string {
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .trim()
  }
  return ""
}
