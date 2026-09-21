-- Migration: 00022_add_activities_fields_and_indexes.sql
-- Description: Allow nullable entity_id, add title and description columns, and add performance indexes

ALTER TABLE public.activities
  ALTER COLUMN entity_id DROP NOT NULL;

ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Performance indexes for filtering activities
CREATE INDEX IF NOT EXISTS idx_activities_org_action
  ON public.activities(organization_id, action);

CREATE INDEX IF NOT EXISTS idx_activities_org_entity_type
  ON public.activities(organization_id, entity_type, created_at DESC);
