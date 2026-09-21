"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/getUser"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer,
  convertLeadToCustomer,
} from "@/lib/services/customers.service"
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerStatusSchema,
  assignCustomerSchema,
  convertLeadToCustomerSchema,
  type CreateCustomerInput,
  type CreateCustomerOutput,
  type UpdateCustomerInput,
  type UpdateCustomerOutput,
} from "@/lib/validations/customer.schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Create Customer
 */
export async function createCustomerAction(
  rawInput: CreateCustomerInput | CreateCustomerOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = createCustomerSchema.parse(rawInput)

    const customer = await createCustomer(validated, organizationId, user.id)

    revalidatePath("/customers")
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create customer"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Customer
 */
export async function updateCustomerAction(
  rawInput: UpdateCustomerInput | UpdateCustomerOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = updateCustomerSchema.parse(rawInput)

    const customer = await updateCustomer(
      validated.id,
      validated,
      organizationId,
      user.id
    )

    revalidatePath("/customers")
    revalidatePath(`/customers/${validated.id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update customer"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Customer Status
 */
export async function updateCustomerStatusAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, status } = updateCustomerStatusSchema.parse(rawInput)

    const customer = await updateCustomer(
      id,
      { id, status },
      organizationId,
      user.id
    )

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to change customer status"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Assign Customer
 */
export async function assignCustomerAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const { id, assigned_to } = assignCustomerSchema.parse(rawInput)

    const customer = await updateCustomer(
      id,
      { id, assigned_to },
      organizationId,
      user.id
    )

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to assign customer"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Soft Delete Customer
 */
export async function softDeleteCustomerAction(
  id: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid customer ID" }
    }

    const customer = await softDeleteCustomer(id, organizationId, user.id)

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete customer"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Restore Soft-Deleted Customer
 */
export async function restoreCustomerAction(
  id: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid customer ID" }
    }

    const customer = await restoreCustomer(id, organizationId, user.id)

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to restore customer"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Convert Lead to Customer
 */
export async function convertLeadToCustomerAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = convertLeadToCustomerSchema.parse(rawInput)

    const customer = await convertLeadToCustomer(
      validated.lead_id,
      organizationId,
      user.id,
      {
        name: validated.name,
        industry: validated.industry,
        assigned_to: validated.assigned_to,
      }
    )

    revalidatePath("/customers")
    revalidatePath("/leads")
    revalidatePath(`/leads/${validated.lead_id}`)
    return { success: true, data: customer }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to convert lead to customer"
    return { success: false, error: message }
  }
}
