-- Migration: 00019_add_customers_assigned_to_and_lead_conversion.sql
-- Description: Add assigned_to, converted_from_lead_id, and deleted_at to customers table

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_from_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Prevent accidental duplicate conversion of the same lead within an organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_org_converted_lead
  ON public.customers(organization_id, converted_from_lead_id)
  WHERE converted_from_lead_id IS NOT NULL;

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_customers_org_active
  ON public.customers(organization_id, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_customers_deleted_at
  ON public.customers(deleted_at)
  WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_assigned_to
  ON public.customers(assigned_to)
  WHERE assigned_to IS NOT NULL;
