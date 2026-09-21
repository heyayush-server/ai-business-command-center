/**
 * lib/services/ai-actions.service.ts
 *
 * Server-side executor for AI pending actions.
 *
 * SECURITY CONTRACT:
 *   - NEVER trust organization_id, user_id, or role from the client.
 *   - All security context comes from server-side session + cookies only.
 *   - The client sends ONLY the pending action ID when approving.
 *   - The payload is re-validated against the Zod schema at execution time.
 *   - Expiry and status checks prevent replay or double-execution.
 *
 * Execution order for every action:
 *   1. Authenticate user (server session)
 *   2. Obtain active organization (server cookie)
 *   3. Verify authorization role
 *   4. Load pending action by ID
 *   5. Verify organization_id matches authenticated org
 *   6. Verify status === 'pending'
 *   7. Verify action is not expired
 *   8. Re-validate stored payload
 *   9. Validate linked entity ownership
 *  10. Execute the DB operation
 *  11. Log activity
 *  12. Mark action as executed
 */

import "server-only"
import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth/getUser"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { logActivity } from "@/lib/services/activities.service"
import {
  isValidAIActionType,
  validateActionPayload,
  buildActionPreview,
  type AIActionType,
} from "@/lib/ai/action-definitions"

// ── Action expiry duration ────────────────────────────────────────────────────

/** Pending actions expire after 15 minutes. */
export const ACTION_EXPIRY_MINUTES = 15

// ── Result types ──────────────────────────────────────────────────────────────

export interface ActionExecutionResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
  actionId: string
}

export interface PendingActionRecord {
  id: string
  organization_id: string
  conversation_id: string | null
  tool_name: string
  tool_input: Record<string, unknown>
  status: string
  created_by: string
  expires_at: string | null
  created_at: string
}

export interface ActionPreviewResult {
  actionId: string
  actionType: AIActionType
  status: string
  expiresAt: string | null
  preview: ReturnType<typeof buildActionPreview>
}

// ── Create a pending action (called by AI prepare tools) ─────────────────────

export async function createPendingAction({
  organizationId,
  userId,
  conversationId,
  actionType,
  payload,
}: {
  organizationId: string
  userId: string
  conversationId: string | null
  actionType: AIActionType
  payload: Record<string, unknown>
}): Promise<ActionPreviewResult> {
  const supabase = await createClient()

  // Validate payload before persisting
  const validated = validateActionPayload(actionType, payload)

  const expiresAt = new Date(Date.now() + ACTION_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("ai_pending_actions")
    .insert({
      organization_id: organizationId,
      conversation_id: conversationId ?? null,
      tool_name: actionType,
    tool_input: validated as unknown as import("@/lib/types/database.types").Json,
      created_by: userId,
      status: "pending",
      expires_at: expiresAt,
    })
    .select("id, organization_id, tool_name, tool_input, status, expires_at, created_at")
    .single()

  if (error || !data) {
    throw new Error(`Failed to create pending action: ${error?.message ?? "unknown"}`)
  }

  const preview = buildActionPreview(actionType, data.tool_input as Record<string, unknown>)

  return {
    actionId: data.id,
    actionType,
    status: data.status,
    expiresAt: data.expires_at,
    preview,
  }
}

// ── Load a pending action for display ────────────────────────────────────────

export async function getPendingAction(
  actionId: string,
  organizationId: string
): Promise<PendingActionRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("ai_pending_actions")
    .select("id, organization_id, conversation_id, tool_name, tool_input, status, created_by, expires_at, created_at")
    .eq("id", actionId)
    .eq("organization_id", organizationId)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    tool_input: data.tool_input as Record<string, unknown>,
  }
}

// ── Approve and execute a pending action ──────────────────────────────────────

export async function approveAiAction(actionId: string): Promise<ActionExecutionResult> {
  // ── Step 1-3: Server-side auth ────────────────────────────────────────────
  const user = await getUser()
  if (!user) {
    return { success: false, message: "Unauthorized: Please sign in.", actionId }
  }

  const currentOrg = await getCurrentOrganization()
  if (!currentOrg) {
    return { success: false, message: "Forbidden: No active organization.", actionId }
  }

  // Only owner/admin/member may approve AI write actions
  if (!["owner", "admin", "member"].includes(currentOrg.userRole)) {
    return {
      success: false,
      message: "Forbidden: Viewer accounts cannot approve write actions.",
      actionId,
    }
  }

  // ── Step 4: Load pending action ───────────────────────────────────────────
  const supabase = await createClient()

  const { data: action, error: fetchError } = await supabase
    .from("ai_pending_actions")
    .select("*")
    .eq("id", actionId)
    .single()

  if (fetchError || !action) {
    return { success: false, message: "Action not found.", actionId }
  }

  // ── Step 5: Organization boundary check ──────────────────────────────────
  if (action.organization_id !== currentOrg.organizationId) {
    return {
      success: false,
      message: "Forbidden: Action does not belong to your organization.",
      actionId,
    }
  }

  // ── Step 6: Status check ──────────────────────────────────────────────────
  if (action.status !== "pending") {
    const statusMsgs: Record<string, string> = {
      executed: "This action has already been executed.",
      cancelled: "This action has been cancelled.",
      expired: "This action has expired.",
      failed: "This action previously failed.",
      approved: "This action is already being processed.",
      rejected: "This action has been rejected.",
    }
    return {
      success: false,
      message: statusMsgs[action.status] ?? `Action is in status: ${action.status}`,
      actionId,
    }
  }

  // ── Step 7: Expiry check ──────────────────────────────────────────────────
  if (action.expires_at && new Date(action.expires_at) < new Date()) {
    // Mark as expired
    await supabase
      .from("ai_pending_actions")
      .update({ status: "expired" })
      .eq("id", actionId)
      .eq("status", "pending") // safe guard: only update if still pending

    return { success: false, message: "This action has expired. Please ask the AI to create a new one.", actionId }
  }

  // ── Step 8: Validate action type ─────────────────────────────────────────
  if (!isValidAIActionType(action.tool_name)) {
    await markFailed(supabase, actionId, "Unknown action type")
    return { success: false, message: "Unknown action type. Cannot execute.", actionId }
  }

  const actionType = action.tool_name as AIActionType

  // ── Step 9: Re-validate stored payload ───────────────────────────────────
  let validatedPayload: Record<string, unknown>
  try {
    validatedPayload = validateActionPayload(
      actionType,
      action.tool_input as Record<string, unknown>
    ) as Record<string, unknown>
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Payload validation failed"
    await markFailed(supabase, actionId, msg)
    return { success: false, message: "Action payload is invalid and cannot be executed.", actionId }
  }

  // ── Step 10: Execute the database operation ───────────────────────────────
  try {
    const result = await executeAction({
      actionType,
      payload: validatedPayload,
      organizationId: currentOrg.organizationId,
      userId: user.id,
      supabase,
    })

    // ── Step 11: Log activity ─────────────────────────────────────────────
    await logActivity({
      organizationId: currentOrg.organizationId,
      actorType: "ai",
      userId: user.id,
      entityType: deriveEntityType(actionType),
      entityId: (result.data?.id as string) ?? null,
      action: actionType,
      title: `AI action approved: ${actionType.replace(/_/g, " ")}`,
      description: `Approved by ${user.email ?? user.id}`,
    }).catch((err) => console.error("[ai-actions] Activity log failed:", err))

    // ── Step 12: Mark as executed ─────────────────────────────────────────
    await supabase
      .from("ai_pending_actions")
      .update({
        status: "executed",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        executed_at: new Date().toISOString(),
        execution_result: (result.data ?? {}) as unknown as import("@/lib/types/database.types").Json,
      })
      .eq("id", actionId)

    return {
      success: true,
      message: result.message,
      data: result.data,
      actionId,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Execution failed"
    console.error(`[ai-actions] Execution error for ${actionId}:`, err)
    await markFailed(supabase, actionId, msg)
    return {
      success: false,
      message: "The action failed during execution. No data was changed.",
      actionId,
    }
  }
}

// ── Cancel a pending action ───────────────────────────────────────────────────

export async function cancelAiAction(actionId: string): Promise<ActionExecutionResult> {
  const user = await getUser()
  if (!user) {
    return { success: false, message: "Unauthorized: Please sign in.", actionId }
  }

  const currentOrg = await getCurrentOrganization()
  if (!currentOrg) {
    return { success: false, message: "Forbidden: No active organization.", actionId }
  }

  const supabase = await createClient()

  const { data: action, error: fetchError } = await supabase
    .from("ai_pending_actions")
    .select("id, organization_id, created_by, status")
    .eq("id", actionId)
    .single()

  if (fetchError || !action) {
    return { success: false, message: "Action not found.", actionId }
  }

  // Organization boundary
  if (action.organization_id !== currentOrg.organizationId) {
    return { success: false, message: "Forbidden: Action does not belong to your organization.", actionId }
  }

  // Only cancel if still pending
  if (action.status !== "pending") {
    return { success: false, message: `Cannot cancel: action is already ${action.status}.`, actionId }
  }

  // Only the creator or an admin/owner can cancel
  const isCreator = action.created_by === user.id
  const isAdminOrOwner = ["owner", "admin"].includes(currentOrg.userRole)

  if (!isCreator && !isAdminOrOwner) {
    return { success: false, message: "Forbidden: You can only cancel your own actions.", actionId }
  }

  const { error: updateError } = await supabase
    .from("ai_pending_actions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", actionId)
    .eq("status", "pending") // safe guard

  if (updateError) {
    return { success: false, message: "Failed to cancel action.", actionId }
  }

  return { success: true, message: "Action cancelled successfully.", actionId }
}

// ── Internal: execute specific action types ───────────────────────────────────

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

async function executeAction({
  actionType,
  payload,
  organizationId,
  userId,
  supabase,
}: {
  actionType: AIActionType
  payload: Record<string, unknown>
  organizationId: string
  userId: string
  supabase: SupabaseClient
}): Promise<{ message: string; data?: Record<string, unknown> }> {
  switch (actionType) {
    case "create_task": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData = { organization_id: organizationId, created_by: userId, ...payload } as any
      const { data, error } = await supabase
        .from("tasks")
        .insert(insertData)
        .select("id, title, status, priority, due_date")
        .single()
      if (error) throw new Error(error.message)
      return { message: `Task "${data.title}" created successfully.`, data: data as Record<string, unknown> }
    }

    case "update_task": {
      const { id, ...updates } = payload as { id: string } & Record<string, unknown>
      const { data, error } = await supabase
        .from("tasks")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .select("id, title, status")
        .single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error("Task not found or does not belong to your organization.")
      return { message: `Task "${data.title}" updated successfully.`, data: data as Record<string, unknown> }
    }

    case "complete_task": {
      const { id } = payload as { id: string }
      const { data, error } = await supabase
        .from("tasks")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .select("id, title, status")
        .single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error("Task not found or does not belong to your organization.")
      return { message: `Task "${data.title}" marked as complete.`, data: data as Record<string, unknown> }
    }

    case "create_lead": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData = { organization_id: organizationId, assigned_to: userId, ...payload } as any
      const { data, error } = await supabase
        .from("leads")
        .insert(insertData)
        .select("id, first_name, last_name, status")
        .single()
      if (error) throw new Error(error.message)
      return {
        message: `Lead "${data.first_name} ${data.last_name}" created successfully.`,
        data: data as Record<string, unknown>,
      }
    }

    case "update_lead": {
      const { id, ...updates } = payload as { id: string } & Record<string, unknown>
      const { data, error } = await supabase
        .from("leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .select("id, first_name, last_name, status")
        .single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error("Lead not found or does not belong to your organization.")
      return {
        message: `Lead "${data.first_name} ${data.last_name}" updated successfully.`,
        data: data as Record<string, unknown>,
      }
    }

    case "create_customer": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData = { organization_id: organizationId, ...payload } as any
      const { data, error } = await supabase
        .from("customers")
        .insert(insertData)
        .select("id, name, status")
        .single()
      if (error) throw new Error(error.message)
      return { message: `Customer "${data.name}" created successfully.`, data: data as Record<string, unknown> }
    }

    case "update_customer": {
      const { id, ...updates } = payload as { id: string } & Record<string, unknown>
      const { data, error } = await supabase
        .from("customers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .select("id, name, status")
        .single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error("Customer not found or does not belong to your organization.")
      return { message: `Customer "${data.name}" updated successfully.`, data: data as Record<string, unknown> }
    }

    case "create_deal": {
      // Verify customer belongs to org
      const { data: cust } = await supabase
        .from("customers")
        .select("id")
        .eq("id", (payload as { customer_id: string }).customer_id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .maybeSingle()
      if (!cust) throw new Error("Customer not found or does not belong to your organization.")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const insertData = { organization_id: organizationId, ...payload } as any
      const { data, error } = await supabase
        .from("deals")
        .insert(insertData)
        .select("id, title, stage, value")
        .single()
      if (error) throw new Error(error.message)
      return { message: `Deal "${data.title}" created successfully.`, data: data as Record<string, unknown> }
    }

    case "update_deal": {
      const { id, ...updates } = payload as { id: string } & Record<string, unknown>
      const { data, error } = await supabase
        .from("deals")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("organization_id", organizationId)
        .is("deleted_at", null)
        .select("id, title, stage")
        .single()
      if (error) throw new Error(error.message)
      if (!data) throw new Error("Deal not found or does not belong to your organization.")
      return { message: `Deal "${data.title}" updated successfully.`, data: data as Record<string, unknown> }
    }

    case "record_activity": {
      const { entity_type, entity_id, action, title, description } = payload as {
        entity_type: string
        entity_id: string | null
        action: string
        title: string
        description: string | null
      }

      // Validate linked entity ownership if specified
      if (entity_id && entity_type !== "general") {
        const tableMap: Record<string, string> = {
          lead: "leads",
          customer: "customers",
          deal: "deals",
          task: "tasks",
        }
        const table = tableMap[entity_type]
        if (table) {
          const { data: entityCheck } = await supabase
            .from(table as "leads" | "customers" | "deals" | "tasks")
            .select("id")
            .eq("id", entity_id)
            .eq("organization_id", organizationId)
            .maybeSingle()
          if (!entityCheck) {
            throw new Error(`${entity_type} not found or does not belong to your organization.`)
          }
        }
      }

      await logActivity({
        organizationId,
        actorType: "user",
        userId,
        entityType: entity_type,
        entityId: entity_id ?? null,
        action,
        title,
        description: description ?? undefined,
      })
      return { message: `Activity "${title}" recorded successfully.` }
    }

    default: {
      const _exhaustiveCheck: never = actionType
      throw new Error(`Unhandled action type: ${_exhaustiveCheck}`)
    }
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function markFailed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  actionId: string,
  reason: string
) {
  await supabase
    .from("ai_pending_actions")
    .update({
      status: "failed",
      execution_result: { error: reason },
    })
    .eq("id", actionId)
    .eq("status", "pending")
}

function deriveEntityType(actionType: AIActionType): string {
  if (actionType.includes("task")) return "task"
  if (actionType.includes("lead")) return "lead"
  if (actionType.includes("customer")) return "customer"
  if (actionType.includes("deal")) return "deal"
  return "general"
}
