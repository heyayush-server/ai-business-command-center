-- Migration: 00015_create_rls_policies.sql
-- Description: Create private schema security definers and row level security policies

-- ==============================================================================
-- 1. Private Schema Helper Functions (SECURITY DEFINER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION private.is_organization_member(target_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = target_organization_id
      AND user_id = (SELECT auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION private.has_organization_role(
  target_organization_id UUID,
  allowed_roles public.member_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = target_organization_id
      AND user_id = (SELECT auth.uid())
      AND role = ANY(allowed_roles)
  );
$$;

-- Revoke default execute on private schema functions
REVOKE ALL ON FUNCTION private.is_organization_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.has_organization_role(UUID, public.member_role[]) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION private.is_organization_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_organization_member(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION private.has_organization_role(UUID, public.member_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_organization_role(UUID, public.member_role[]) TO service_role;

-- ==============================================================================
-- 2. Enable Row-Level Security on All Public Tables
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Profiles Policies
-- ==============================================================================

CREATE POLICY "profiles_select_policy"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.organization_members target_m
      JOIN public.organization_members my_m ON target_m.organization_id = my_m.organization_id
      WHERE target_m.user_id = public.profiles.id
        AND my_m.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "profiles_update_policy"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ==============================================================================
-- 4. Organizations Policies
-- ==============================================================================

CREATE POLICY "organizations_select_policy"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(id));

CREATE POLICY "organizations_insert_policy"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "organizations_update_policy"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING (private.has_organization_role(id, ARRAY['owner'::public.member_role, 'admin'::public.member_role]))
  WITH CHECK (private.has_organization_role(id, ARRAY['owner'::public.member_role, 'admin'::public.member_role]));

-- ==============================================================================
-- 5. Organization Members Policies (NON-RECURSIVE)
-- ==============================================================================

CREATE POLICY "organization_members_select_policy"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      WHERE om.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "organization_members_insert_policy"
  ON public.organization_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can create their initial owner membership during onboarding
    user_id = (SELECT auth.uid())
    -- Or admins/owners can add members to their organization
    OR organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      WHERE om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner'::public.member_role, 'admin'::public.member_role)
    )
  );

CREATE POLICY "organization_members_update_policy"
  ON public.organization_members
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      WHERE om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner'::public.member_role, 'admin'::public.member_role)
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      WHERE om.user_id = (SELECT auth.uid())
        AND om.role IN ('owner'::public.member_role, 'admin'::public.member_role)
    )
  );

CREATE POLICY "organization_members_delete_policy"
  ON public.organization_members
  FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) -- Leave organization
    OR organization_id IN (
      SELECT om.organization_id
      FROM public.organization_members om
      WHERE om.user_id = (SELECT auth.uid())
        AND om.role = 'owner'::public.member_role
    )
  );

-- ==============================================================================
-- 6. Business Tables Policies (Leads, Customers, Deals, Tasks)
-- ==============================================================================

-- Leads
CREATE POLICY "leads_select_policy"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "leads_insert_policy"
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "leads_update_policy"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "leads_delete_policy"
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  );

-- Customers
CREATE POLICY "customers_select_policy"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "customers_insert_policy"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "customers_update_policy"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "customers_delete_policy"
  ON public.customers
  FOR DELETE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  );

-- Deals
CREATE POLICY "deals_select_policy"
  ON public.deals
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "deals_insert_policy"
  ON public.deals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "deals_update_policy"
  ON public.deals
  FOR UPDATE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "deals_delete_policy"
  ON public.deals
  FOR DELETE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  );

-- Tasks
CREATE POLICY "tasks_select_policy"
  ON public.tasks
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "tasks_insert_policy"
  ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "tasks_update_policy"
  ON public.tasks
  FOR UPDATE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role, 'member'::public.member_role]
    )
  );

CREATE POLICY "tasks_delete_policy"
  ON public.tasks
  FOR DELETE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  );

-- ==============================================================================
-- 7. Activities (Immutable Audit Log) Policies
-- ==============================================================================

CREATE POLICY "activities_select_policy"
  ON public.activities
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "activities_insert_policy"
  ON public.activities
  FOR INSERT
  TO authenticated
  WITH CHECK (private.is_organization_member(organization_id));

-- Note: No UPDATE or DELETE policies on activities (strictly immutable)

-- ==============================================================================
-- 8. AI Modules Policies (Conversations, Messages, Pending Actions, Usage)
-- ==============================================================================

-- AI Conversations
CREATE POLICY "ai_conversations_all_policy"
  ON public.ai_conversations
  FOR ALL
  TO authenticated
  USING (
    private.is_organization_member(organization_id)
    AND user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    private.is_organization_member(organization_id)
    AND user_id = (SELECT auth.uid())
  );

-- AI Messages
CREATE POLICY "ai_messages_select_policy"
  ON public.ai_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = public.ai_messages.conversation_id
        AND private.is_organization_member(c.organization_id)
        AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "ai_messages_insert_policy"
  ON public.ai_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = public.ai_messages.conversation_id
        AND private.is_organization_member(c.organization_id)
        AND c.user_id = (SELECT auth.uid())
    )
  );

-- AI Pending Actions (Supervised Write Actions)
CREATE POLICY "ai_pending_actions_select_policy"
  ON public.ai_pending_actions
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "ai_pending_actions_insert_policy"
  ON public.ai_pending_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.is_organization_member(organization_id)
    AND created_by = (SELECT auth.uid())
  );

CREATE POLICY "ai_pending_actions_update_policy"
  ON public.ai_pending_actions
  FOR UPDATE
  TO authenticated
  USING (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
  );

-- AI Usage
CREATE POLICY "ai_usage_select_policy"
  ON public.ai_usage
  FOR SELECT
  TO authenticated
  USING (private.is_organization_member(organization_id));

CREATE POLICY "ai_usage_insert_policy"
  ON public.ai_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    private.is_organization_member(organization_id)
    AND user_id = (SELECT auth.uid())
  );
