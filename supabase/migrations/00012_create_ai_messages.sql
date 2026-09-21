-- Migration: 00012_create_ai_messages.sql
-- Description: Create ai_messages table with JSONB parts for AI SDK 7.0 compatibility

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content TEXT,
  parts JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
