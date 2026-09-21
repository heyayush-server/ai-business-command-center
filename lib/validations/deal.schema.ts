import { z } from "zod"

export const dealStageEnum = z.enum([
  "discovery",
  "proposal",
  "negotiation",
  "closed_won",
  "closed_lost",
])

export type DealStageType = z.infer<typeof dealStageEnum>

export const DEAL_STAGES_CONFIG: Array<{ stage: DealStageType; label: string }> = [
  { stage: "discovery", label: "Discovery" },
  { stage: "proposal", label: "Proposal" },
  { stage: "negotiation", label: "Negotiation" },
  { stage: "closed_won", label: "Closed Won" },
  { stage: "closed_lost", label: "Closed Lost" },
]

export const createDealSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Deal title is required")
    .max(150, "Deal title cannot exceed 150 characters"),
  customer_id: z
    .string()
    .uuid("Each deal must belong to a valid customer"),
  stage: dealStageEnum.default("discovery"),
  value: z.coerce
    .number()
    .min(0, "Value must be zero or greater")
    .default(0),
  currency: z
    .string()
    .trim()
    .min(1)
    .max(10)
    .default("USD")
    .transform((val) => val.toUpperCase()),
  expected_close: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected close date must be in YYYY-MM-DD format")
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
  notes: z
    .string()
    .trim()
    .max(5000, "Notes cannot exceed 5000 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const updateDealSchema = createDealSchema.partial().extend({
  id: z.string().uuid("Invalid deal ID"),
})

export const changeDealStageSchema = z.object({
  id: z.string().uuid("Invalid deal ID"),
  stage: dealStageEnum,
})

export const assignDealSchema = z.object({
  id: z.string().uuid("Invalid deal ID"),
  assigned_to: z
    .string()
    .uuid("Invalid assignee ID")
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const dealFilterSchema = z.object({
  search: z.string().optional().default(""),
  stage: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  customer_id: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  assigned_to: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  sortBy: z
    .enum(["created_at", "title", "value", "stage", "expected_close", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
  includeDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true"),
})

export type CreateDealInput = z.input<typeof createDealSchema>
export type CreateDealOutput = z.output<typeof createDealSchema>
export type UpdateDealInput = z.input<typeof updateDealSchema>
export type UpdateDealOutput = z.output<typeof updateDealSchema>
export type ChangeDealStageInput = z.infer<typeof changeDealStageSchema>
export type AssignDealInput = z.infer<typeof assignDealSchema>
export type DealFilterParams = z.infer<typeof dealFilterSchema>
