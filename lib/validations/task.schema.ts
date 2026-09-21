import { z } from "zod"

export const taskStatusEnum = z.enum(["todo", "in_progress", "done", "cancelled"])
export const taskPriorityEnum = z.enum(["low", "medium", "high", "urgent"])

export type TaskStatusType = z.infer<typeof taskStatusEnum>
export type TaskPriorityType = z.infer<typeof taskPriorityEnum>

export const TASK_STATUS_CONFIG: Array<{ status: TaskStatusType; label: string }> = [
  { status: "todo", label: "To Do" },
  { status: "in_progress", label: "In Progress" },
  { status: "done", label: "Completed" },
  { status: "cancelled", label: "Cancelled" },
]

export const TASK_PRIORITY_CONFIG: Array<{ priority: TaskPriorityType; label: string }> = [
  { priority: "low", label: "Low" },
  { priority: "medium", label: "Medium" },
  { priority: "high", label: "High" },
  { priority: "urgent", label: "Urgent" },
]

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required")
    .max(200, "Task title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  status: taskStatusEnum.default("todo"),
  priority: taskPriorityEnum.default("medium"),
  due_date: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  assigned_to: z
    .string()
    .uuid("Assigned user must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  lead_id: z
    .string()
    .uuid("Linked lead must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  customer_id: z
    .string()
    .uuid("Linked customer must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  deal_id: z
    .string()
    .uuid("Linked deal must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid("Invalid task ID"),
})

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  status: taskStatusEnum,
})

export const assignTaskSchema = z.object({
  id: z.string().uuid("Invalid task ID"),
  assigned_to: z
    .string()
    .uuid("Invalid assignee ID")
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const taskFilterSchema = z.object({
  search: z.string().optional().default(""),
  status: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  priority: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  assigned_to: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  due_date_filter: z
    .enum(["all", "today", "overdue", "this_week", "upcoming"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["due_date", "priority", "status", "title", "created_at", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  includeDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true"),
})

export type CreateTaskInput = z.input<typeof createTaskSchema>
export type CreateTaskOutput = z.output<typeof createTaskSchema>
export type UpdateTaskInput = z.input<typeof updateTaskSchema>
export type UpdateTaskOutput = z.output<typeof updateTaskSchema>
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
export type AssignTaskInput = z.infer<typeof assignTaskSchema>
export type TaskFilterParams = z.infer<typeof taskFilterSchema>
