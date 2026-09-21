"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/getUser"
import { assertRole } from "@/lib/auth/assertRole"
import { createManualActivity } from "@/lib/services/activities.service"
import {
  createActivitySchema,
  type CreateActivityInput,
  type CreateActivityOutput,
} from "@/lib/validations/activity.schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Create Manual Activity (note, call, meeting, etc.)
 */
export async function createActivityAction(
  rawInput: CreateActivityInput | CreateActivityOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = createActivitySchema.parse(rawInput)

    const activity = await createManualActivity(
      organizationId,
      user.id,
      validated
    )

    revalidatePath("/activities")
    if (validated.entity_id) {
      if (validated.entity_type === "lead") {
        revalidatePath(`/leads/${validated.entity_id}`)
      } else if (validated.entity_type === "customer") {
        revalidatePath(`/customers/${validated.entity_id}`)
      } else if (validated.entity_type === "deal") {
        revalidatePath(`/deals/${validated.entity_id}`)
        revalidatePath("/deals")
      } else if (validated.entity_type === "task") {
        revalidatePath("/tasks")
      }
    }

    return { success: true, data: activity }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to record activity"
    return { success: false, error: message }
  }
}
