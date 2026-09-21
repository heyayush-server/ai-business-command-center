# AI Business Command Center

An enterprise-grade, multi-tenant operations command center and AI Business Copilot. It integrates customer relationship management (leads, customers, deals pipeline, tasks, activities), retrieval-augmented generation (RAG) over company documents, human-supervised AI actions, and a proactive deterministic business intelligence engine into a unified executive workspace.

Built with Next.js 16 (App Router), React 19, Supabase PostgreSQL with Row-Level Security (RLS), and Vercel AI SDK 7.0.

---

## 🏛️ Architecture Overview

The system employs a strict multi-tenant boundary with server-side organization context enforcement, read-only analytical intelligence, and human-in-the-loop action staging for all write operations.

### High-Level Architecture Flow

```
User / Executive
      │
      ▼
Next.js 16 Application (App Router & Server Actions)
      │
      ▼
AI Business Copilot (Vercel AI SDK 7.0)
      │
      ▼
MCP-Style Business Tool Layer (lib/mcp)
      ├── CRM Tools (Leads, Deals, Customers, Tasks, Activities)
      ├── Knowledge Base Tool (RAG Vector Search)
      ├── Dashboard Intelligence Tool (High-Level KPIs)
      └── Proactive Business Insights Tool (get_business_insights)
      │
      ▼
Domain Services Layer (lib/services)
      ├── insights.service.ts
      ├── dashboard.service.ts
      ├── knowledge.service.ts
      ├── ai-actions.service.ts
      └── leads / deals / customers / tasks / activities services
      │
      ▼
Supabase PostgreSQL (Row-Level Security & pgvector)
```

### Write Security & Human Approval Flow

The AI Copilot **never** mutates CRM records directly. All state-modifying requests strictly follow a two-phase commit with human supervision:

```
AI User Request ("Schedule follow-up call with Acme Corp for tomorrow")
      │
      ▼
prepare_* MCP Tool (e.g., prepare_create_task)
      │
      ▼
Validated against Zod Schema & Stored in ai_pending_actions Table
(Status: 'pending', 15-minute TTL, linked to organization & user session)
      │
      ▼
Interactive Approval Card Rendered in Chat / UI
      │
      ├── [User Clicks Reject] ──► Status marked 'cancelled'
      │
      └── [User Clicks Approve]
                  │
                  ▼
      Secure Action Executor (Server-Side Session Only)
                  │
                  ▼
      PostgreSQL Mutation + Immutable Activity Audit Log
```

---

## 🌟 Core Capabilities

### 1. Proactive AI Business Intelligence (Phase 14)
- **Deterministic Rules Engine**: Identifies overdue tasks, stalled deals, stale leads, inactive customer accounts, pipeline concentration risks, and activity logging gaps.
- **Hallucination-Free Executive Briefing**: Synthesizes factual numbers directly from database aggregates with zero fake metrics.
- **Categorized Severity**: Flags issues across `critical`, `warning`, and `info` tiers.
- **Executive Dashboard Integration**: Dedicated AI Insights section on the dashboard with direct entity navigation and action triggers.

### 2. AI Business Copilot & MCP Tool Layer (Phase 13)
- **Unified MCP Registry (`lib/mcp/server.ts`)**: Binds AI tools dynamically to authenticated user and organization session contexts.
- **Read & Write Tool Separation**: Read operations execute immediately; write operations route through `prepare_*` tools for supervisor approval.
- **Role-Gated Permissions**: Viewers can run analytical queries and read insights, but cannot stage write actions.

### 3. RAG Company Knowledge Base (Phase 12)
- **Document Ingestion**: Supports PDF, TXT, and Markdown upload with chunking and organization-isolated vector storage via PostgreSQL `pgvector`.
- **Private Storage**: Stored in a private Supabase Storage bucket; access is strictly verified on the server.
- **Semantic Retrieval**: The AI assistant uses semantic search to cite company SOPs, refund policies, and pricing guides without prompt injection vulnerabilities.

### 4. Enterprise CRM & Pipeline Management (Phases 1–4)
- **Leads Management**: Prospect capture, status tracking (`new`, `contacted`, `qualifying`, `qualified`, `lost`), and conversion to customer accounts.
- **Deals & Pipeline Kanban**: Multi-stage sales tracking (`discovery`, `proposal`, `negotiation`, `closed_won`, `closed_lost`) with value calculations and expected close alerts.
- **Customer Lifecycle Directory**: 360-degree account view with contact details and converted lead tracking.
- **Operational Task Orchestration**: Priority queues (`low`, `medium`, `high`, `urgent`), due date reminders, and assignments.
- **Immutable Activity Audit Log**: Tracks every system and user event with actor attribution.

---

## 🔒 Multi-Tenant Security Model

1. **PostgreSQL Row-Level Security (RLS)**: Every business table (`leads`, `customers`, `deals`, `tasks`, `activities`, `knowledge_documents`, `knowledge_chunks`, `ai_pending_actions`) contains an `organization_id` foreign key. RLS policies enforce that users can only access rows belonging to their active organization.
2. **Server-Side Authority**: Client-supplied `organization_id` or `user_id` values are never trusted. All tenant resolution occurs server-side via authenticated session cookies.
3. **Soft-Delete Enforcement**: Queries enforce `deleted_at IS NULL` to ensure soft-deleted records never appear in analytics or leak across tenants.
4. **Untrusted RAG Content**: Retrieved document chunks are treated as untrusted data in LLM prompts; instructions embedded inside user documents cannot trigger tool calls.

---

## 💻 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 and Turbopack
- **Language**: TypeScript 5 (Strict mode)
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with pgvector & Row-Level Security
- **Authentication**: Supabase Auth with `@supabase/ssr`
- **AI Framework**: [Vercel AI SDK 7.0](https://sdk.vercel.ai/) with Anthropic Claude & OpenAI provider packages
- **Document Processing**: `pdf-parse` for text extraction
- **Validation**: Zod 4
- **Testing**: [Vitest](https://vitest.dev/)

---

## 📂 Project Structure

```
ai-business-command-center/
├── app/
│   ├── (app)/                   # Authenticated application workspace
│   │   ├── dashboard/           # Executive Command Center & Proactive Insights
│   │   ├── leads/               # Prospect tracking & qualification
│   │   ├── customers/           # 360-degree customer directory
│   │   ├── deals/               # Sales pipeline
│   │   ├── tasks/               # Operational task queue
│   │   ├── activities/          # Immutable organization audit trail
│   │   ├── knowledge/           # RAG Document Management
│   │   └── ai/                  # AI Business Copilot console
│   ├── (auth)/                  # Login, register, auth callback
│   └── api/
│       └── ai/chat/             # Streaming AI Route Handler with MCP context
├── components/
│   ├── ui/                      # Base UI primitives (buttons, cards, badges, dialogs)
│   ├── shared/                  # PageHeader, EmptyState, LoadingSpinner
│   └── features/
│       ├── dashboard/           # AIInsightsPanel, MetricCards, PipelineChart
│       ├── ai/                  # ActionApprovalCard, ChatMessage
│       └── knowledge/           # DocumentUploadModal, KnowledgeTable
├── docs/
│   └── insights.md              # Phase 14 Insights Architecture & Type Reference
├── lib/
│   ├── ai/                      # AI provider configuration, prompts, mock mode
│   ├── ai-actions/              # Action schemas, preview builders, execution types
│   ├── auth/                    # getUser, getCurrentOrganization helpers
│   ├── mcp/                     # MCP Tool Registry & context
│   │   ├── context.ts           # Trusted server security context
│   │   ├── server.ts            # getMCPTools aggregator
│   │   └── tools/               # Modular AI tools (leads, deals, tasks, insights)
│   ├── services/                # Server-side business logic
│   │   ├── insights.service.ts  # Deterministic business intelligence engine
│   │   ├── dashboard.service.ts # Real-time dashboard KPI aggregations
│   │   ├── knowledge.service.ts # RAG embedding, chunking, and search
│   │   └── ai-actions.service.ts# Staged action validation & execution
│   ├── types/                   # Database and domain TypeScript types
│   │   ├── database.types.ts    # Generated Supabase PostgreSQL types
│   │   └── insights.ts          # Central insight types & briefing interfaces
│   └── supabase/                # Server and browser Supabase clients
├── supabase/
│   └── migrations/              # 25 ordered PostgreSQL migrations with RLS
└── __tests__/                   # Vitest unit and integration test suite
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `20.9.0+` (or `22+`)
- npm `10+`

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/ishansharma/ai-business-command-center.git
cd ai-business-command-center

# Install dependencies
npm install
```

### 2. Environment Configuration
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Key configuration variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Configuration
# Set AI_MODE="mock" for zero-cost local testing without API keys
AI_MODE=mock
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# RAG & Embeddings
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

The repository maintains an automated Vitest test suite verifying domain services, schema validations, MCP tools, and organization isolation:

```bash
# Run unit and integration tests
npm test

# Run TypeScript typecheck
npx tsc --noEmit

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## 📋 Implementation Status

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | Project Foundation, Design System, Landing Page & App Shell | ✅ Completed |
| **Phase 1** | Supabase Auth, PostgreSQL Migrations, RLS Policies & Org Multi-Tenancy | ✅ Completed |
| **Phase 2** | Leads, Customers Lifecycle & Immutable Activity Audit Log | ✅ Completed |
| **Phase 3** | Deals Pipeline (Kanban) & Linked Operational Task Queue | ✅ Completed |
| **Phase 4** | Real-Time Dashboard Analytics with Supabase Aggregations | ✅ Completed |
| **Phase 5** | Vercel AI SDK 7.0 Streaming Assistant & Mock Chat Engine | ✅ Completed |
| **Phase 6** | System Security & Multi-Tenant Authorization Hardening | ✅ Completed |
| **Phase 7** | Production Polish, Zero-State UX & Validation Integrity | ✅ Completed |
| **Phase 8** | Interactive Deals Pipeline & Stage Progression | ✅ Completed |
| **Phase 9** | Customer Account Intelligence & Lead Conversion Flow | ✅ Completed |
| **Phase 10** | Operational Tasks SLA Engine & Priority Reminders | ✅ Completed |
| **Phase 11** | Human-in-the-Loop AI Action Staging & Secure Approval System | ✅ Completed |
| **Phase 12** | Organization RAG Knowledge Base (PDF/TXT/MD via pgvector) | ✅ Completed |
| **Phase 13** | MCP-Powered Business Copilot & Tool Layer Architecture | ✅ Completed |
| **Phase 14** | Proactive AI Business Intelligence & Deterministic Insights Engine | ✅ Completed |

---

## 📖 Documentation Links

- [Proactive Insights Engine Architecture (docs/insights.md)](docs/insights.md)

---

## 📄 License
Portfolio and engineering learning project by Ishan Sharma.
