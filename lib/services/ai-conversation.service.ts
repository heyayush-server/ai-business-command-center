import { createClient } from "@/lib/supabase/server"
import type { Database, MessageRole, Json } from "@/lib/types/database.types"

export type AIConversationRow = Database["public"]["Tables"]["ai_conversations"]["Row"]
export type AIMessageRow = Database["public"]["Tables"]["ai_messages"]["Row"]

/**
 * Retrieves an existing conversation or creates a new one,
 * verifying that the conversation strictly belongs to the active organization.
 */
export async function getOrCreateConversation(
  organizationId: string,
  userId: string,
  conversationId?: string | null,
  initialTitle?: string
): Promise<AIConversationRow> {
  const supabase = await createClient()

  if (conversationId) {
    const { data, error } = await supabase
      .from("ai_conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("organization_id", organizationId)
      .maybeSingle()

    if (!error && data) {
      return data
    }
  }

  // Create new conversation
  const title = initialTitle || "Business Operations Briefing"
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      organization_id: organizationId,
      user_id: userId,
      title,
    })
    .select("*")
    .single()

  if (error || !data) {
    console.error("[ai-conversation.service] Error creating conversation:", error)
    throw new Error(error?.message || "Failed to create AI conversation")
  }

  return data
}

/**
 * Saves a user or assistant message to the database.
 */
export async function saveAIMessage({
  conversationId,
  role,
  content,
  parts,
  model,
  tokenCount,
}: {
  conversationId: string
  role: MessageRole
  content?: string | null
  parts?: unknown
  model?: string | null
  tokenCount?: number | null
}): Promise<AIMessageRow> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content: content || null,
      parts: (parts || null) as Json,
      model: model || null,
      token_count: tokenCount || null,
    })
    .select("*")
    .single()

  if (error || !data) {
    console.error("[ai-conversation.service] Error saving AI message:", error)
    throw new Error(error?.message || "Failed to persist AI message")
  }

  // Update conversation updated_at
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)

  return data
}

/**
 * Retrieves all messages for a conversation, verifying organization ownership.
 */
export async function getConversationMessages(
  conversationId: string,
  organizationId: string
): Promise<AIMessageRow[]> {
  const supabase = await createClient()

  // Verify conversation belongs to org
  const { data: conv, error: convErr } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (convErr || !conv) {
    return []
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[ai-conversation.service] Error fetching messages:", error)
    return []
  }

  return data || []
}

/**
 * Lists conversations for the current user in the active organization.
 */
export async function listConversations(
  organizationId: string,
  userId: string,
  limit = 20
): Promise<AIConversationRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[ai-conversation.service] Error listing conversations:", error)
    return []
  }

  return data || []
}
