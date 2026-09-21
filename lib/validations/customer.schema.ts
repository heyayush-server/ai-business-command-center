import { z } from "zod"

export const customerStatusEnum = z.enum(["active", "inactive", "churned"])

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(150, "Customer name cannot exceed 150 characters"),
  industry: z
    .string()
    .trim()
    .max(100, "Industry cannot exceed 100 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  status: customerStatusEnum.default("active"),
  primary_contact_name: z
    .string()
    .trim()
    .max(120, "Contact name cannot exceed 120 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  primary_contact_email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  primary_contact_phone: z
    .string()
    .trim()
    .max(50, "Phone number cannot exceed 50 characters")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
  website: z
    .string()
    .trim()
    .max(255, "Website cannot exceed 255 characters")
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
  converted_from_lead_id: z
    .string()
    .uuid("Converted lead must be a valid ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.string().uuid("Invalid customer ID"),
})

export const updateCustomerStatusSchema = z.object({
  id: z.string().uuid("Invalid customer ID"),
  status: customerStatusEnum,
})

export const assignCustomerSchema = z.object({
  id: z.string().uuid("Invalid customer ID"),
  assigned_to: z
    .string()
    .uuid("Invalid assignee ID")
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const convertLeadToCustomerSchema = z.object({
  lead_id: z.string().uuid("Invalid lead ID"),
  name: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional(),
  industry: z.string().trim().max(100).optional().nullable(),
  assigned_to: z
    .string()
    .uuid("Invalid assignee ID")
    .optional()
    .nullable()
    .or(z.literal(""))
    .transform((val) => (val === "" || !val ? null : val)),
})

export const customerFilterSchema = z.object({
  search: z.string().optional().default(""),
  status: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  assigned_to: z
    .string()
    .optional()
    .transform((val) => (val === "all" || !val ? undefined : val)),
  sortBy: z
    .enum(["created_at", "name", "status", "primary_contact_name", "updated_at"])
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  includeDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === "true"),
})

export type CreateCustomerInput = z.input<typeof createCustomerSchema>
export type CreateCustomerOutput = z.output<typeof createCustomerSchema>
export type UpdateCustomerInput = z.input<typeof updateCustomerSchema>
export type UpdateCustomerOutput = z.output<typeof updateCustomerSchema>
export type ConvertLeadToCustomerInput = z.infer<typeof convertLeadToCustomerSchema>
export type CustomerFilterParams = z.infer<typeof customerFilterSchema>
