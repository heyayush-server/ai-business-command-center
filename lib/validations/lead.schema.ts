import { z } from "zod"

export const leadStatusEnum = z.enum([
  "new",
  "contacted",
  "qualifying",
  "qualified",
  "lost",
])

export const createLeadSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name cannot exceed 100 characters"),
  last_name: z
    .string()
    .trim()
    .max(100, "Last name cannot exceed 100 characters")
    .default(""),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  phone: z
    .string()
    .trim()
    .max(50, "Phone number cannot exceed 50 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  company: z
    .string()
    .trim()
    .max(150, "Company cannot exceed 150 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  status: leadStatusEnum.default("new"),
  source: z
    .string()
    .trim()
    .max(100, "Source cannot exceed 100 characters")
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
  assigned_to: z
    .string()
    .uuid("Assigned user must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: z.string().uuid("Invalid lead ID"),
})

export const updateLeadStatusSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
  status: leadStatusEnum,
})

export const assignLeadSchema = z.object({
  id: z.string().uuid("Invalid lead ID"),
  assigned_to: z
    .string()
    .uuid("Invalid assignee ID")
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const leadFilterSchema = z.object({
  search: z.string().optional().default(""),
  status: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  source: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  assigned_to: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  sortBy: z
    .enum(["created_at", "first_name", "company", "status", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  includeDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true"),
})

export type CreateLeadInput = z.input<typeof createLeadSchema>
export type CreateLeadOutput = z.output<typeof createLeadSchema>
export type UpdateLeadInput = z.input<typeof updateLeadSchema>
export type UpdateLeadOutput = z.output<typeof updateLeadSchema>
export type LeadFilterParams = z.infer<typeof leadFilterSchema>
