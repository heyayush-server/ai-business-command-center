-- Migration: 00020_add_deals_fields_and_soft_delete.sql
-- Description: Add title, currency, expected_close, notes, and deleted_at to deals table

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS expected_close DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Backfill title from name if name exists, or ensure name has a fallback if required
UPDATE public.deals SET title = name WHERE title IS NULL AND name IS NOT NULL;
ALTER TABLE public.deals ALTER COLUMN name DROP NOT NULL;

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_deals_org_stage
  ON public.deals(organization_id, stage)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_customer
  ON public.deals(customer_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_deals_assigned_to
  ON public.deals(assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deals_deleted_at
  ON public.deals(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deals_expected_close
  ON public.deals(expected_close)
  WHERE deleted_at IS NULL;
