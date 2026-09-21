-- Migration: 00017_create_indexes.sql
-- Description: Create indexes for fast multi-tenant queries and relational joins

-- Organization Members
CREATE INDEX idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_organization_members_org_role ON public.organization_members(organization_id, role);

-- Leads
CREATE INDEX idx_leads_org_status ON public.leads(organization_id, status);
CREATE INDEX idx_leads_org_created ON public.leads(organization_id, created_at DESC);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);

-- Customers
CREATE INDEX idx_customers_org_status ON public.customers(organization_id, status);
CREATE INDEX idx_customers_org_created ON public.customers(organization_id, created_at DESC);

-- Deals
CREATE INDEX idx_deals_org_stage ON public.deals(organization_id, stage);
CREATE INDEX idx_deals_customer ON public.deals(customer_id);
CREATE INDEX idx_deals_org_close_date ON public.deals(organization_id, expected_close_date);

-- Tasks (Explicit nullable FKs)
CREATE INDEX idx_tasks_org_status_priority ON public.tasks(organization_id, status, priority);
CREATE INDEX idx_tasks_assigned_due ON public.tasks(assigned_to, due_date);
CREATE INDEX idx_tasks_lead_id ON public.tasks(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_tasks_customer_id ON public.tasks(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_tasks_deal_id ON public.tasks(deal_id) WHERE deal_id IS NOT NULL;

-- Activities (Polymorphic FK)
CREATE INDEX idx_activities_org_created ON public.activities(organization_id, created_at DESC);
CREATE INDEX idx_activities_entity ON public.activities(entity_type, entity_id);
CREATE INDEX idx_activities_actor ON public.activities(actor_type, user_id);

-- AI Tables
CREATE INDEX idx_ai_conversations_org_user ON public.ai_conversations(organization_id, user_id);
CREATE INDEX idx_ai_messages_conv_created ON public.ai_messages(conversation_id, created_at ASC);
CREATE INDEX idx_ai_pending_actions_org_status ON public.ai_pending_actions(organization_id, status);
CREATE INDEX idx_ai_usage_org_created ON public.ai_usage(organization_id, created_at DESC);
