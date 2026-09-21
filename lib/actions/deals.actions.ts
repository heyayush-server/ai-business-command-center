"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/getUser"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createDeal,
  updateDeal,
  changeDealStage,
  assignDeal,
  softDeleteDeal,
  restoreDeal,
} from "@/lib/services/deals.service"
import {
  createDealSchema,
  updateDealSchema,
  changeDealStageSchema,
  assignDealSchema,
  type CreateDealInput,
  type CreateDealOutput,
  type UpdateDealInput,
  type UpdateDealOutput,
} from "@/lib/validations/deal.schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Create Deal
 */
export async function createDealAction(
  rawInput: CreateDealInput | CreateDealOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = createDealSchema.parse(rawInput)

    const deal = await createDeal(organizationId, user.id, validated)

    revalidatePath("/deals")
    revalidatePath(`/customers/${validated.customer_id}`)
    return { success: true, data: deal }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create deal"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Deal
 */
export async function updateDealAction(
  rawInput: UpdateDealInput | UpdateDealOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = updateDealSchema.parse(rawInput)

    const deal = await updateDeal(
      validated.id,
      organizationId,
      user.id,
      validated
    )

    revalidatePath("/deals")
    revalidatePath(`/deals/${validated.id}`)
    if (deal.customer_id) {
      revalidatePath(`/customers/${deal.customer_id}`)
    }
    return { success: true, data: deal }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update deal"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Change Deal Stage
 */
export async function changeDealStageAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, stage } = changeDealStageSchema.parse(rawInput)

    const deal = await changeDealStage(id, organizationId, user.id, stage)

    revalidatePath("/deals")
    revalidatePath(`/deals/${id}`)
    if (deal.customer_id) {
      revalidatePath(`/customers/${deal.customer_id}`)
    }
    return { success: true, data: deal }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to change deal stage"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Assign Deal to Team Member
 */
export async function assignDealAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, assigned_to } = assignDealSchema.parse(rawInput)

    const deal = await assignDeal(id, organizationId, user.id, assigned_to)

    revalidatePath("/deals")
    revalidatePath(`/deals/${id}`)
    return { success: true, data: deal }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign deal"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Soft Delete Deal
 */
export async function softDeleteDealAction(
  id: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid deal ID" }
    }

    await softDeleteDeal(id, organizationId, user.id)

    revalidatePath("/deals")
    revalidatePath(`/deals/${id}`)
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete deal"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Restore Soft-Deleted Deal
 */
export async function restoreDealAction(
  id: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid deal ID" }
    }

    await restoreDeal(id, organizationId, user.id)

    revalidatePath("/deals")
    revalidatePath(`/deals/${id}`)
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to restore deal"
    return { success: false, error: message }
  }
}
