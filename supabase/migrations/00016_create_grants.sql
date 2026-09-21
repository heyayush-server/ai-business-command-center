-- Migration: 00016_create_grants.sql
-- Description: Apply explicit least-privilege table grants

-- ==============================================================================
-- 1. Revoke all public / anonymous permissions on business tables
-- ==============================================================================

REVOKE ALL ON TABLE public.profiles FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.organizations FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.organization_members FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.leads FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.customers FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.deals FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.tasks FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.activities FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.ai_conversations FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.ai_messages FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.ai_pending_actions FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.ai_usage FROM anon, PUBLIC;

-- ==============================================================================
-- 2. Grant permissions to authenticated role (still governed by RLS)
-- ==============================================================================

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.organizations TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.organization_members TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tasks TO authenticated;

-- Activities are append-only for authenticated users
GRANT SELECT, INSERT ON TABLE public.activities TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ai_conversations TO authenticated;
GRANT SELECT, INSERT ON TABLE public.ai_messages TO authenticated;

-- Pending actions can be read, staged, and updated (approved/rejected)
GRANT SELECT, INSERT, UPDATE ON TABLE public.ai_pending_actions TO authenticated;

-- AI usage can be read and inserted
GRANT SELECT, INSERT ON TABLE public.ai_usage TO authenticated;

-- ==============================================================================
-- 3. Grant full permissions to service_role for background tasks
-- ==============================================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
