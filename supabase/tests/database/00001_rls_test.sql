-- pgTAP Test Suite for Row-Level Security and Multi-Tenancy
-- File: supabase/tests/database/00001_rls_test.sql
-- Covers Test Cases A through K from Architecture v2.2

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(11);

-- ==============================================================================
-- Test Fixtures Setup (Run as postgres/superuser)
-- ==============================================================================

-- Create two test organizations
INSERT INTO public.organizations (id, name, slug)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Org Alpha', 'org-alpha'),
  ('22222222-2222-2222-2222-222222222222', 'Org Beta', 'org-beta');

-- Create mock auth users and profiles
-- (In local pgTAP tests, we mock auth.users / auth.uid())
INSERT INTO auth.users (id, email)
VALUES
  ('aaaaaaa1-1111-1111-1111-111111111111', 'owner_alpha@example.com'),
  ('aaaaaaa2-1111-1111-1111-111111111111', 'admin_alpha@example.com'),
  ('aaaaaaa3-1111-1111-1111-111111111111', 'member_alpha@example.com'),
  ('aaaaaaa4-1111-1111-1111-111111111111', 'viewer_alpha@example.com'),
  ('bbbbbbb1-2222-2222-2222-222222222222', 'owner_beta@example.com');

INSERT INTO public.profiles (id, full_name)
VALUES
  ('aaaaaaa1-1111-1111-1111-111111111111', 'Alpha Owner'),
  ('aaaaaaa2-1111-1111-1111-111111111111', 'Alpha Admin'),
  ('aaaaaaa3-1111-1111-1111-111111111111', 'Alpha Member'),
  ('aaaaaaa4-1111-1111-1111-111111111111', 'Alpha Viewer'),
  ('bbbbbbb1-2222-2222-2222-222222222222', 'Beta Owner')
ON CONFLICT (id) DO NOTHING;

-- Memberships for Org Alpha
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaa1-1111-1111-1111-111111111111', 'owner'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaa2-1111-1111-1111-111111111111', 'admin'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaa3-1111-1111-1111-111111111111', 'member'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaa4-1111-1111-1111-111111111111', 'viewer'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbb1-2222-2222-2222-222222222222', 'owner');

-- Pre-seed leads for both orgs
INSERT INTO public.leads (id, organization_id, first_name, last_name, email)
VALUES
  ('33333333-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Alpha', 'Lead', 'alpha.lead@acme.com'),
  ('33333333-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Beta', 'Lead', 'beta.lead@globex.com');

-- Pre-seed pending actions
INSERT INTO public.ai_pending_actions (id, organization_id, tool_name, tool_input, status, created_by)
VALUES
  ('44444444-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'updateDeal', '{"dealId":"1"}'::jsonb, 'pending', 'aaaaaaa3-1111-1111-1111-111111111111'),
  ('44444444-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'updateDeal', '{"dealId":"2"}'::jsonb, 'pending', 'bbbbbbb1-2222-2222-2222-222222222222');

-- ==============================================================================
-- Test Case A: User can read own organization's leads
-- ==============================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa3-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (SELECT count(*)::integer FROM public.leads WHERE organization_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'Test A: User can read own organization leads'
);

-- ==============================================================================
-- Test Case B: User cannot read another organization's leads
-- ==============================================================================
SELECT is(
  (SELECT count(*)::integer FROM public.leads WHERE organization_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'Test B: User cannot read another organization leads'
);

-- ==============================================================================
-- Test Case C: User cannot insert into another organization
-- ==============================================================================
SELECT throws_ok(
  $$
    INSERT INTO public.leads (organization_id, first_name, last_name, email)
    VALUES ('22222222-2222-2222-2222-222222222222', 'Intruder', 'Lead', 'intruder@acme.com')
  $$,
  '42501', -- new row violates row-level security policy
  NULL,
  'Test C: User cannot insert into another organization'
);

-- ==============================================================================
-- Test Case D: User cannot move a row to another organization (cross-org UPDATE)
-- ==============================================================================
SELECT throws_ok(
  $$
    UPDATE public.leads
    SET organization_id = '22222222-2222-2222-2222-222222222222'
    WHERE id = '33333333-1111-1111-1111-111111111111'
  $$,
  '42501',
  NULL,
  'Test D: User cannot move lead to another organization'
);

-- ==============================================================================
-- Test Case E: Viewer cannot create leads
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa4-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT throws_ok(
  $$
    INSERT INTO public.leads (organization_id, first_name, last_name, email)
    VALUES ('11111111-1111-1111-1111-111111111111', 'Viewer', 'Lead', 'viewer.lead@acme.com')
  $$,
  '42501',
  NULL,
  'Test E: Viewer cannot insert leads'
);

-- ==============================================================================
-- Test Case F: Member cannot change member roles
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa3-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (
    WITH updated AS (
      UPDATE public.organization_members
      SET role = 'owner'
      WHERE user_id = 'aaaaaaa3-1111-1111-1111-111111111111'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  0,
  'Test F: Member cannot elevate own role to owner'
);

-- ==============================================================================
-- Test Case G: Admin can manage members where allowed
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa2-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (
    WITH updated AS (
      UPDATE public.organization_members
      SET role = 'viewer'
      WHERE user_id = 'aaaaaaa3-1111-1111-1111-111111111111'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  1,
  'Test G: Admin can update member roles within own organization'
);

-- ==============================================================================
-- Test Case H: Owner can perform owner-level operation
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa1-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (
    WITH updated AS (
      UPDATE public.organizations
      SET name = 'Org Alpha Renamed'
      WHERE id = '11111111-1111-1111-1111-111111111111'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  1,
  'Test H: Owner can update organization attributes'
);

-- ==============================================================================
-- Test Case I: organization_members has no recursion failure
-- ==============================================================================
SELECT lives_ok(
  $$
    SELECT * FROM public.organization_members
  $$,
  'Test I: organization_members SELECT executes without recursion failure'
);

-- ==============================================================================
-- Test Case J: Member cannot approve pending AI action (requires admin/owner)
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa3-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (
    WITH updated AS (
      UPDATE public.ai_pending_actions
      SET status = 'approved', approved_by = 'aaaaaaa3-1111-1111-1111-111111111111'
      WHERE id = '44444444-1111-1111-1111-111111111111'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  0,
  'Test J: Member cannot approve pending AI action'
);

-- ==============================================================================
-- Test Case K: Org 1 cannot approve Org 2 pending action
-- ==============================================================================
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaa1-1111-1111-1111-111111111111", "role": "authenticated"}';

SELECT is(
  (
    WITH updated AS (
      UPDATE public.ai_pending_actions
      SET status = 'approved', approved_by = 'aaaaaaa1-1111-1111-1111-111111111111'
      WHERE id = '44444444-2222-2222-2222-222222222222'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  0,
  'Test K: Org 1 owner cannot approve Org 2 pending action'
);

SELECT * FROM finish();

ROLLBACK;
