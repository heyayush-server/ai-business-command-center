"use server"

import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/getUser"
import { assertRole } from "@/lib/auth/assertRole"
import {
  createTask,
  updateTask,
  updateTaskStatus,
  assignTask,
  softDeleteTask,
  restoreTask,
} from "@/lib/services/tasks.service"
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  assignTaskSchema,
  type CreateTaskInput,
  type CreateTaskOutput,
  type UpdateTaskInput,
  type UpdateTaskOutput,
} from "@/lib/validations/task.schema"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Server Action: Create Task
 */
export async function createTaskAction(
  rawInput: CreateTaskInput | CreateTaskOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = createTaskSchema.parse(rawInput)

    const task = await createTask(organizationId, user.id, validated)

    revalidatePath("/tasks")
    if (validated.lead_id) revalidatePath(`/leads/${validated.lead_id}`)
    if (validated.customer_id) revalidatePath(`/customers/${validated.customer_id}`)
    if (validated.deal_id) revalidatePath(`/deals/${validated.deal_id}`)

    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create task"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Task
 */
export async function updateTaskAction(
  rawInput: UpdateTaskInput | UpdateTaskOutput
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = updateTaskSchema.parse(rawInput)

    const task = await updateTask(
      validated.id,
      organizationId,
      user.id,
      validated
    )

    revalidatePath("/tasks")
    if (task.lead_id) revalidatePath(`/leads/${task.lead_id}`)
    if (task.customer_id) revalidatePath(`/customers/${task.customer_id}`)
    if (task.deal_id) revalidatePath(`/deals/${task.deal_id}`)

    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update task"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Update Task Status (including quick completion)
 */
export async function updateTaskStatusAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = updateTaskStatusSchema.parse(rawInput)

    const task = await updateTaskStatus(
      validated.id,
      organizationId,
      user.id,
      validated.status
    )

    revalidatePath("/tasks")
    if (task.lead_id) revalidatePath(`/leads/${task.lead_id}`)
    if (task.customer_id) revalidatePath(`/customers/${task.customer_id}`)
    if (task.deal_id) revalidatePath(`/deals/${task.deal_id}`)

    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update task status"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Assign Task
 */
export async function assignTaskAction(
  rawInput: unknown
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    const validated = assignTaskSchema.parse(rawInput)

    const task = await assignTask(
      validated.id,
      organizationId,
      user.id,
      validated.assigned_to
    )

    revalidatePath("/tasks")
    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to assign task"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Soft Delete Task
 */
export async function softDeleteTaskAction(
  taskId: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!taskId || typeof taskId !== "string") {
      return { success: false, error: "Invalid task ID" }
    }

    await softDeleteTask(taskId, organizationId, user.id)

    revalidatePath("/tasks")
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete task"
    return { success: false, error: message }
  }
}

/**
 * Server Action: Restore Task
 */
export async function restoreTaskAction(
  taskId: string
): Promise<ActionResponse> {
  try {
    const user = await getUser()
    if (!user) {
      return { success: false, error: "Unauthorized: User not authenticated" }
    }

    const { organizationId } = await assertRole(["owner", "admin", "member"])

    if (!taskId || typeof taskId !== "string") {
      return { success: false, error: "Invalid task ID" }
    }

    const task = await restoreTask(taskId, organizationId, user.id)

    revalidatePath("/tasks")
    return { success: true, data: task }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to restore task"
    return { success: false, error: message }
  }
}
