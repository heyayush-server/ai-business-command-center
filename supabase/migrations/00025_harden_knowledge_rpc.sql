-- Migration: 00025_harden_knowledge_rpc.sql
-- Description: Require explicit authorized organization context for RAG vector search RPC.

create or replace function public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  p_organization_id uuid default null
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security invoker
set search_path = public, private
as $$
begin
  if p_organization_id is null then
    raise exception 'Organization context is required for knowledge search'
      using errcode = '42501';
  end if;

  if not private.has_organization_role(
    p_organization_id,
    array['owner', 'admin', 'member', 'viewer']
  ) then
    raise exception 'Not authorized to search knowledge for this organization'
      using errcode = '42501';
  end if;

  return query
  select
    kc.id,
    kc.document_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  join public.knowledge_documents kd on kc.document_id = kd.id
  where
    kc.organization_id = p_organization_id
    and kd.organization_id = p_organization_id
    and kd.deleted_at is null
  order by kc.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 20);
end;
$$;
