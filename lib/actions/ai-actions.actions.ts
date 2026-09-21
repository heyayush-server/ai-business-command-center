"use server"

import { revalidatePath } from "next/cache"
import { approveAiAction, cancelAiAction } from "@/lib/services/ai-actions.service"

export interface AiActionResponse {
  success: boolean
  message: string
  data?: Record<string, unknown>
  actionId: string
}

/**
 * Server Action: Approve and execute a pending AI action.
 *
 * The client sends ONLY the actionId.
 * All security context (user, org, role) is obtained server-side.
 * The payload is re-validated at execution time.
 */
export async function approveAiActionAction(actionId: string): Promise<AiActionResponse> {
  if (!actionId || typeof actionId !== "string") {
    return { success: false, message: "Invalid action ID.", actionId: actionId ?? "" }
  }

  const result = await approveAiAction(actionId)

  if (result.success) {
    // Revalidate all business data pages after a write action completes
    revalidatePath("/tasks")
    revalidatePath("/leads")
    revalidatePath("/customers")
    revalidatePath("/deals")
    revalidatePath("/activities")
    revalidatePath("/dashboard")
  }

  return result
}

/**
 * Server Action: Cancel a pending AI action.
 *
 * Only the action creator or an admin/owner may cancel.
 * All security context is obtained server-side.
 */
export async function cancelAiActionAction(actionId: string): Promise<AiActionResponse> {
  if (!actionId || typeof actionId !== "string") {
    return { success: false, message: "Invalid action ID.", actionId: actionId ?? "" }
  }

  return cancelAiAction(actionId)
}
