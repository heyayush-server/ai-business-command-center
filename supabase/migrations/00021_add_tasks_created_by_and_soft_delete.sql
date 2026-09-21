-- Migration: 00021_add_tasks_created_by_and_soft_delete.sql
-- Description: Add created_by, deleted_at, and query performance indexes to tasks table

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_org_status
  ON public.tasks(organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_org_assigned
  ON public.tasks(organization_id, assigned_to)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_org_due
  ON public.tasks(organization_id, due_date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at
  ON public.tasks(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_lead_id
  ON public.tasks(lead_id)
  WHERE lead_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_customer_id
  ON public.tasks(customer_id)
  WHERE customer_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_deal_id
  ON public.tasks(deal_id)
  WHERE deal_id IS NOT NULL AND deleted_at IS NULL;
