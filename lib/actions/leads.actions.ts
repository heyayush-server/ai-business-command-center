"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/getUser"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createLead,
  updateLead,
  softDeleteLead,
  restoreLead,
} from "@/lib/services/leads.service"
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  type CreateLeadInput,
  type CreateLeadOutput,
  type UpdateLeadInput,
  type UpdateLeadOutput,
} from "@/lib/validations/lead.schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Create Lead
 * Guarded by Auth -> Org context -> Role -> Zod Validation -> Service -> Audit Log -> Revalidate.
 */
export async function createLeadAction(
  rawInput: CreateLeadInput | CreateLeadOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validatedInput = createLeadSchema.parse(rawInput)

    const lead = await createLead(validatedInput, organizationId, user.id)

    revalidatePath("/leads")
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create lead"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Lead
 */
export async function updateLeadAction(
  rawInput: UpdateLeadInput | UpdateLeadOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validatedInput = updateLeadSchema.parse(rawInput)

    const lead = await updateLead(
      validatedInput.id,
      validatedInput,
      organizationId,
      user.id
    )

    revalidatePath("/leads")
    revalidatePath(`/leads/${validatedInput.id}`)
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update lead"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Lead Status
 */
export async function updateLeadStatusAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, status } = updateLeadStatusSchema.parse(rawInput)

    const lead = await updateLead(id, { id, status }, organizationId, user.id)

    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to change lead status"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Assign Lead
 */
export async function assignLeadAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, assigned_to } = assignLeadSchema.parse(rawInput)

    const lead = await updateLead(
      id,
      { id, assigned_to },
      organizationId,
      user.id
    )

    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to assign lead"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Soft Delete Lead
 */
export async function softDeleteLeadAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid lead ID" }
    }

    const lead = await softDeleteLead(id, organizationId, user.id)

    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete lead"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Restore Soft-Deleted Lead
 */
export async function restoreLeadAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid lead ID" }
    }

    const lead = await restoreLead(id, organizationId, user.id)

    revalidatePath("/leads")
    revalidatePath(`/leads/${id}`)
    return { success: true, data: lead }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to restore lead"
    return { success: false, error: message }
  }
}
