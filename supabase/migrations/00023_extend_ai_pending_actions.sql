-- Migration: 00023_extend_ai_pending_actions.sql
-- Description: Extend ai_pending_actions for Phase 11 Human Approval workflow
--
-- Adds:
--   - expires_at column for action expiration
--   - cancelled_at column for explicit cancellation tracking
--   - New status values: executed, cancelled, failed
--   - Index on (status, expires_at) for expiration checks
--   - Updated RLS: allow members to cancel their own pending actions

-- 1. Add new values to pending_action_status enum
ALTER TYPE public.pending_action_status ADD VALUE IF NOT EXISTS 'executed';
ALTER TYPE public.pending_action_status ADD VALUE IF NOT EXISTS 'cancelled';
ALTER TYPE public.pending_action_status ADD VALUE IF NOT EXISTS 'failed';

-- 2. Add expiration and cancellation columns
ALTER TABLE public.ai_pending_actions
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 3. Set a default expiration of 15 minutes for any existing pending rows
UPDATE public.ai_pending_actions
  SET expires_at = created_at + INTERVAL '15 minutes'
  WHERE expires_at IS NULL AND status = 'pending';

-- 4. Add supporting indexes
CREATE INDEX IF NOT EXISTS ai_pending_actions_status_expires_idx
  ON public.ai_pending_actions (status, expires_at);

CREATE INDEX IF NOT EXISTS ai_pending_actions_created_by_idx
  ON public.ai_pending_actions (created_by);

CREATE INDEX IF NOT EXISTS ai_pending_actions_organization_status_idx
  ON public.ai_pending_actions (organization_id, status);

-- 5. Extend RLS update policy to also allow the action creator
--    to cancel their own pending actions (members can self-cancel)
DROP POLICY IF EXISTS "ai_pending_actions_update_policy" ON public.ai_pending_actions;

CREATE POLICY "ai_pending_actions_update_policy"
  ON public.ai_pending_actions
  FOR UPDATE
  TO authenticated
  USING (
    -- Admins/owners can update any action
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
    -- OR: the creator can cancel their own pending action
    OR (
      created_by = (SELECT auth.uid())
      AND private.is_organization_member(organization_id)
    )
  )
  WITH CHECK (
    private.has_organization_role(
      organization_id,
      ARRAY['owner'::public.member_role, 'admin'::public.member_role]
    )
    OR (
      created_by = (SELECT auth.uid())
      AND private.is_organization_member(organization_id)
    )
  );
