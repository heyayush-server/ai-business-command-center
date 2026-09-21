-- Migration: 00018_add_leads_notes_and_soft_delete.sql
-- Description: Add notes and deleted_at (soft delete support) to leads table

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Partial index for active (non-deleted) leads queries
CREATE INDEX IF NOT EXISTS idx_leads_org_active
  ON public.leads(organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_leads_deleted_at
  ON public.leads(deleted_at)
  WHERE deleted_at IS NOT NULL;
