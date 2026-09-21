/**
 * lib/ai/action-definitions.ts
 *
 * Central typed action definition layer for Phase 11: AI Human Approval.
 *
 * Every action supported by the AI write system is defined here with:
 *   - action type constant
 *   - human-readable label
 *   - Zod input schema for validation (enforced both at creation and execution)
 *   - preview shape for the approval card UI
 *
 * IMPORTANT: The executor (ai-actions.service.ts) re-validates the stored payload
 * against the schema at execution time — client-supplied data is NEVER trusted.
 */

import { z } from "zod"

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const optionalUUID = z
  .union([z.string().uuid(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v == null || v === "" ? null : v))


const optionalString = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((v) => (v === "" || v == null ? null : v))

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .nullable()
  .or(z.literal(""))
  .transform((v) => (v === "" || v == null ? null : v))

// ── Action type literals ──────────────────────────────────────────────────────

export const AI_ACTION_TYPES = [
  "create_task",
  "update_task",
  "complete_task",
  "create_lead",
  "update_lead",
  "create_customer",
  "update_customer",
  "create_deal",
  "update_deal",
  "record_activity",
] as const

export type AIActionType = (typeof AI_ACTION_TYPES)[number]

// ── Per-action payload schemas ────────────────────────────────────────────────

export const actionSchemas = {
  create_task: z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    description: optionalString,
    status: z.enum(["todo", "in_progress", "done", "cancelled"]).default("todo"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    due_date: optionalDateString,
    assigned_to: optionalUUID,
    lead_id: optionalUUID,
    customer_id: optionalUUID,
    deal_id: optionalUUID,
  }),

  update_task: z.object({
    id: z.string().uuid("task_id is required"),
    title: z.string().trim().min(1).max(200).optional(),
    description: optionalString,
    status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    due_date: optionalDateString,
    assigned_to: optionalUUID,
  }),

  complete_task: z.object({
    id: z.string().uuid("task_id is required"),
  }),

  create_lead: z.object({
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z.string().trim().min(1, "Last name is required").max(100),
    email: z.string().email().optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    company: z.string().trim().max(200).optional().nullable(),
    source: z.string().trim().max(100).optional().nullable(),
    status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).default("new"),
    notes: optionalString,
    assigned_to: optionalUUID,
  }),

  update_lead: z.object({
    id: z.string().uuid("lead_id is required"),
    first_name: z.string().trim().min(1).max(100).optional(),
    last_name: z.string().trim().min(1).max(100).optional(),
    email: z.string().email().optional().nullable(),
    phone: z.string().trim().max(30).optional().nullable(),
    company: z.string().trim().max(200).optional().nullable(),
    status: z.enum(["new", "contacted", "qualifying", "qualified", "lost"]).optional(),
    notes: optionalString,
    assigned_to: optionalUUID,
  }),

  create_customer: z.object({
    name: z.string().trim().min(1, "Customer name is required").max(200),
    industry: z.string().trim().max(100).optional().nullable(),
    status: z.enum(["active", "inactive", "churned"]).default("active"),
    primary_contact_name: z.string().trim().max(200).optional().nullable(),
    primary_contact_email: z.string().email().optional().nullable(),
    primary_contact_phone: z.string().trim().max(30).optional().nullable(),
    website: z.string().url().optional().nullable().or(z.literal("")).transform((v) => v === "" ? null : v),
    notes: optionalString,
    assigned_to: optionalUUID,
  }),

  update_customer: z.object({
    id: z.string().uuid("customer_id is required"),
    name: z.string().trim().min(1).max(200).optional(),
    industry: z.string().trim().max(100).optional().nullable(),
    status: z.enum(["active", "inactive", "churned"]).optional(),
    primary_contact_name: z.string().trim().max(200).optional().nullable(),
    primary_contact_email: z.string().email().optional().nullable(),
    assigned_to: optionalUUID,
    notes: optionalString,
  }),

  create_deal: z.object({
    title: z.string().trim().min(1, "Deal title is required").max(200),
    customer_id: z.string().uuid("customer_id is required"),
    stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).default("discovery"),
    value: z.number().min(0).default(0),
    currency: z.string().trim().length(3).default("USD"),
    expected_close: optionalDateString,
    notes: optionalString,
    assigned_to: optionalUUID,
  }),

  update_deal: z.object({
    id: z.string().uuid("deal_id is required"),
    title: z.string().trim().min(1).max(200).optional(),
    stage: z.enum(["discovery", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
    value: z.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    expected_close: optionalDateString,
    notes: optionalString,
    assigned_to: optionalUUID,
  }),

  record_activity: z.object({
    entity_type: z.enum(["lead", "customer", "deal", "task", "general"]),
    entity_id: optionalUUID,
    action: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    description: optionalString,
  }),
} as const satisfies Record<AIActionType, z.ZodType>

export type ActionPayload<T extends AIActionType> = z.input<(typeof actionSchemas)[T]>
export type ActionPayloadOutput<T extends AIActionType> = z.output<(typeof actionSchemas)[T]>

// ── Human-readable labels and descriptions ────────────────────────────────────

export const ACTION_LABELS: Record<AIActionType, string> = {
  create_task: "Create Task",
  update_task: "Update Task",
  complete_task: "Complete Task",
  create_lead: "Create Lead",
  update_lead: "Update Lead",
  create_customer: "Create Customer",
  update_customer: "Update Customer",
  create_deal: "Create Deal",
  update_deal: "Update Deal",
  record_activity: "Record Activity",
}

// ── Preview builder: produces a display-friendly summary from a payload ───────

export interface ActionPreview {
  label: string
  actionType: AIActionType
  fields: Array<{ key: string; value: string | null | undefined }>
}

export function buildActionPreview(
  actionType: AIActionType,
  payload: Record<string, unknown>
): ActionPreview {
  const label = ACTION_LABELS[actionType]

  const fieldMap: Record<string, string> = {
    title: "Title",
    first_name: "First Name",
    last_name: "Last Name",
    name: "Name",
    email: "Email",
    phone: "Phone",
    company: "Company",
    status: "Status",
    stage: "Stage",
    priority: "Priority",
    due_date: "Due Date",
    expected_close: "Expected Close",
    value: "Value",
    currency: "Currency",
    description: "Description",
    notes: "Notes",
    action: "Action",
    entity_type: "Entity Type",
  }

  const fields: ActionPreview["fields"] = []

  // Only include non-null, non-UUID-lookup fields in the preview
  for (const [key, displayName] of Object.entries(fieldMap)) {
    const val = payload[key]
    if (val != null && val !== "") {
      fields.push({ key: displayName, value: String(val) })
    }
  }

  return { label, actionType, fields }
}

// ── Validate a stored payload against its action schema (for executor) ────────

export function validateActionPayload<T extends AIActionType>(
  actionType: T,
  payload: unknown
): z.output<(typeof actionSchemas)[T]> {
  const schema = actionSchemas[actionType]
  return schema.parse(payload) as z.output<(typeof actionSchemas)[T]>
}

// ── Type guard ────────────────────────────────────────────────────────────────

export function isValidAIActionType(value: unknown): value is AIActionType {
  return typeof value === "string" && AI_ACTION_TYPES.includes(value as AIActionType)
}
