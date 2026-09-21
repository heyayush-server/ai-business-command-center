-- Migration: 00001_create_enums.sql
-- Description: Create all application enums per Architecture v2.2

CREATE TYPE public.member_role AS ENUM (
  'owner',
  'admin',
  'member',
  'viewer'
);

CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualifying',
  'qualified',
  'lost'
);

CREATE TYPE public.customer_status AS ENUM (
  'active',
  'inactive',
  'churned'
);

CREATE TYPE public.deal_stage AS ENUM (
  'discovery',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

CREATE TYPE public.task_status AS ENUM (
  'todo',
  'in_progress',
  'done',
  'cancelled'
);

CREATE TYPE public.task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE public.pending_action_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'expired'
);

CREATE TYPE public.actor_type AS ENUM (
  'user',
  'ai'
);

CREATE TYPE public.message_role AS ENUM (
  'user',
  'assistant',
  'system',
  'tool'
);
