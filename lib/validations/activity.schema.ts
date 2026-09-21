import { z } from "zod"

export const activityTypeEnum = z.enum([
  "note",
  "call",
  "email",
  "meeting",
  "follow_up",
  "status_change",
  "task",
  "other",
])

export type ActivityType = z.infer<typeof activityTypeEnum>

export const entityTypeEnum = z.enum([
  "lead",
  "customer",
  "deal",
  "task",
  "organization",
  "general",
])

export type ActivityEntityType = z.infer<typeof entityTypeEnum>

export const ACTIVITY_TYPES_CONFIG: Array<{
  type: ActivityType
  label: string
  description: string
}> = [
  { type: "note", label: "Note", description: "Internal notes and observations" },
  { type: "call", label: "Call", description: "Phone call with client or lead" },
  { type: "email", label: "Email", description: "Sent or received email correspondence" },
  { type: "meeting", label: "Meeting", description: "Live or virtual conference" },
  { type: "follow_up", label: "Follow-up", description: "Follow-up check-in" },
  { type: "status_change", label: "Status Change", description: "Entity lifecycle change" },
  { type: "task", label: "Task", description: "Operational task or action" },
  { type: "other", label: "Other", description: "General business activity" },
]

export const createActivitySchema = z.object({
  action: activityTypeEnum,
  title: z
    .string()
    .trim()
    .min(1, "Activity title is required")
    .max(200, "Activity title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(5000, "Description cannot exceed 5000 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  entity_type: entityTypeEnum.default("organization"),
  entity_id: z
    .string()
    .uuid("Entity ID must be a valid UUID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  details: z.record(z.string(), z.unknown()).optional().default({}),
})

export const activityFilterSchema = z.object({
  search: z.string().optional().default(""),
  action: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  entity_type: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  user_id: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  date_filter: z
    .enum(["all", "today", "yesterday", "this_week", "this_month"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
})

export type CreateActivityInput = z.input<typeof createActivitySchema>
export type CreateActivityOutput = z.output<typeof createActivitySchema>
export type ActivityFilterParams = z.infer<typeof activityFilterSchema>
