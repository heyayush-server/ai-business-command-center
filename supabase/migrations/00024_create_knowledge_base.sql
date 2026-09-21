-- Enable vector extension
create extension if not exists vector;

-- Create enum for knowledge document status
create type public.knowledge_document_status as enum (
  'pending',
  'processing',
  'processed',
  'failed'
);

-- Create knowledge_documents table
create table public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  filename text not null,
  title text,
  mime_type text not null,
  file_size bigint not null,
  storage_path text not null,
  status public.knowledge_document_status not null default 'pending',
  error_message text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone
);

-- Create knowledge_chunks table
create table public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null,
  embedding vector(1536) not null,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- Set up RLS for knowledge_documents
alter table public.knowledge_documents enable row level security;

create policy "Users can view knowledge_documents in their organizations"
  on public.knowledge_documents
  for select
  to authenticated
  using (private.has_organization_role(organization_id, array['owner', 'admin', 'member', 'viewer']));

create policy "Users can insert knowledge_documents in their organizations"
  on public.knowledge_documents
  for insert
  to authenticated
  with check (private.has_organization_role(organization_id, array['owner', 'admin', 'member']));

create policy "Users can update knowledge_documents in their organizations"
  on public.knowledge_documents
  for update
  to authenticated
  using (private.has_organization_role(organization_id, array['owner', 'admin', 'member']))
  with check (private.has_organization_role(organization_id, array['owner', 'admin', 'member']));

-- Set up RLS for knowledge_chunks
alter table public.knowledge_chunks enable row level security;

create policy "Users can view knowledge_chunks in their organizations"
  on public.knowledge_chunks
  for select
  to authenticated
  using (
    private.has_organization_role(organization_id, array['owner', 'admin', 'member', 'viewer'])
    and
    exists (
      select 1 from public.knowledge_documents kd
      where kd.id = knowledge_chunks.document_id and kd.deleted_at is null
    )
  );

create policy "Users can insert knowledge_chunks in their organizations"
  on public.knowledge_chunks
  for insert
  to authenticated
  with check (private.has_organization_role(organization_id, array['owner', 'admin', 'member']));

-- Insert knowledge storage bucket
insert into storage.buckets (id, name, public)
values ('knowledge', 'knowledge', false)
on conflict (id) do nothing;

-- Storage bucket RLS policies
create policy "Users can view objects in knowledge bucket for their organization"
  on storage.objects for select
  using (
    bucket_id = 'knowledge' 
    and 
    (select private.has_organization_role((string_to_array(name, '/'))[1]::uuid, array['owner', 'admin', 'member', 'viewer']))
  );

create policy "Users can insert objects in knowledge bucket for their organization"
  on storage.objects for insert
  with check (
    bucket_id = 'knowledge' 
    and 
    (select private.has_organization_role((string_to_array(name, '/'))[1]::uuid, array['owner', 'admin', 'member']))
  );

create policy "Users can update objects in knowledge bucket for their organization"
  on storage.objects for update
  using (
    bucket_id = 'knowledge' 
    and 
    (select private.has_organization_role((string_to_array(name, '/'))[1]::uuid, array['owner', 'admin', 'member']))
  );

create policy "Users can delete objects in knowledge bucket for their organization"
  on storage.objects for delete
  using (
    bucket_id = 'knowledge' 
    and 
    (select private.has_organization_role((string_to_array(name, '/'))[1]::uuid, array['owner', 'admin', 'member']))
  );


-- RPC function for semantic search
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
as $$
begin
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
    and kd.deleted_at is null
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;
