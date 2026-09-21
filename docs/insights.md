# Proactive Business Intelligence & Insights Engine (Phase 14)

## Overview

Phase 14 elevates the AI Business Command Center from a reactive assistant into a proactive business intelligence layer. The engine continuously aggregates organization-scoped CRM data, identifies operational anomalies, calculates SLA bottlenecks, flags stalled deals and leads, and summarizes findings in an executive briefing.

All metrics and signals are **100% deterministic and grounded** in real database records. The LLM never invents fake metrics or hallucinates numbers.

---

## Architecture Flow

```
PostgreSQL Database (Row-Level Security)
  ├── tasks (due dates, priority, status)
  ├── leads (qualification stage, inactivity)
  ├── deals (stage duration, target close dates, concentration)
  ├── customers (health check, inactivity)
  └── activities (recent audit logs, communication gaps)
            │
            ▼ (Parallel org-scoped query via Supabase Server Client)
insights.service.ts (Deterministic Business Rules Engine)
            │
            ├─────────────────────────┬─────────────────────────┐
            ▼                         ▼                         ▼
Executive Dashboard UI          MCP Tool Layer             AI Chat Stream
(AI Insights Feed)      (get_business_insights)      (Real-time Briefings)
```

---

## Supported Insight Types

All insights are defined in `lib/types/insights.ts` via the `INSIGHT_TYPES` constant:

| Insight Type | Trigger Condition | Default Severity | Recommended Action |
| :--- | :--- | :--- | :--- |
| `OVERDUE_TASK` | Open task with `due_date < today` | `critical` (urgent/high or >3d) / `warning` | Complete or reschedule task |
| `UPCOMING_TASK` | Open task with `due_date <= today + 2d` and `high`/`urgent` priority | `warning` (due today) / `info` | Review task requirements |
| `STALE_LEAD` | Open lead untouched for >14 days without activity | `warning` | Follow up with lead |
| `HIGH_PRIORITY_LEAD_INACTIVE` | Lead in `qualifying`/`contacted` with no activity in 7 days | `warning` | Schedule outreach or call |
| `STALE_DEAL` | Open deal in `negotiation` for >14d or other stages for >21d | `critical` (value ≥ $20k) / `warning` | Review deal with customer |
| `DEAL_CLOSING_SOON` | Target close date is overdue or within next 7 days | `critical` (overdue close) / `warning` | Confirm closing terms |
| `INACTIVE_CUSTOMER` | Active customer with no logged activity for >30 days | `warning` (>60d) / `info` (>30d) | Conduct account health check |
| `PIPELINE_RISK` | Single deal represents ≥40% of total active pipeline | `warning` | Diversify sales pipeline |
| `ACTIVITY_GAP` | Active CRM records exist but no activity logged for >3 days | `info` | Log recent calls or notes |
| `CONVERSION_CHANGE` | ≥8 leads with <10% conversion velocity | `info` | Review qualification criteria |

---

## Security Model

1. **Strict Organization Scoping**: All database queries are filtered with `.eq("organization_id", organizationId)`. Client-supplied organization IDs are never accepted.
2. **Soft-Delete Respect**: All queries enforce `.is("deleted_at", null)` to guarantee deleted records never pollute analytics.
3. **Read-Only Intelligence**: The insights service does not mutate data.
4. **Role Enforcement**: Viewers, members, admins, and owners can all view insights, but write operations derived from recommendations remain role-restricted.

---

## How Recommendations Become Approved Actions

Recommendations in insights are strictly **informational signals**. When a user decides to act upon an insight:

```
1. Insight Generated
   (e.g., OVERDUE_TASK: "Complete or reschedule this task")
         │
         ▼
2. User Requests Action via Copilot or Dashboard UI
   ("Complete task 'Finalize Contract' or reschedule to tomorrow")
         │
         ▼
3. MCP Prepare Tool Staged
   (prepare_complete_task or prepare_update_task)
         │
         ▼
4. Stored in ai_pending_actions Table
   (Status: 'pending', 15-minute TTL, Zod re-validated)
         │
         ▼
5. Human Supervisor Reviews Approval Card in UI
   (Approve or Reject with 1 click)
         │
         ▼
6. Action Executor Applies Mutation
   (Updates task in PostgreSQL, logs immutable activity audit record)
```

The AI **never** bypasses the pending action flow or mutates CRM records directly.

---

## Phase 15: Google Gemini AI Integration & Insights Caching

In Phase 15, the insights engine is enhanced with:
1. **Real Runtime Gemini Integration (`@google/genai`)**:
   - The AI Copilot dynamically connects to Google Gemini via `@google/genai` SDK using `AI_PROVIDER=gemini` and `GEMINI_MODEL=gemini-2.5-flash`.
   - The MCP tool `get_business_insights` is exposed to Gemini as a native function declaration, allowing Gemini to analyze real-time business anomalies and provide executive briefings on demand.
2. **Deterministic 30-Second TTL Caching**:
   - Memory caching (`CACHE_TTL_MS = 30_000`) prevents redundant parallel queries during rapid user interactions or concurrent AI chat invocations.
   - Cache is bypassable via `{ skipCache: true }` and explicitly clearable via `clearInsightsCache(orgId)`.
3. **Landing Page Sandbox Simulation**:
   - Prospective clients can experience the proactive insights engine directly from the public landing page via an isolated client-side simulation.

