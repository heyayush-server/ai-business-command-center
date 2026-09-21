# AI Business Command Center

> **Status: Phase 0 Foundation Complete**  
> *Note: Authentication, database, AI, and business functionality are being implemented in later phases.*

An autonomous, enterprise-grade business operations platform synthesizing lead acquisition, customer lifecycle management, visual deal pipelines, task orchestration, and auditable AI execution into a single unified command center.

Built as an engineering portfolio and deep-learning project to demonstrate production-grade SaaS architecture, PostgreSQL Row-Level Security multi-tenancy, and human-in-the-loop autonomous AI tool calling.

---

## 🚀 Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19 and Turbopack
- **Language**: TypeScript 5 (strict typing)
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/) (Base-Nova design system)
- **Database & Auth**: [Supabase PostgreSQL](https://supabase.com/) with `@supabase/ssr` (Phase 1+)
- **Security**: PostgreSQL Row-Level Security (RLS) with private-schema `SECURITY DEFINER` helper functions
- **AI Engine**: [Vercel AI SDK 7.0](https://sdk.vercel.ai/) with Anthropic Claude & OpenAI provider packages
- **Validation**: Zod 3 + React Hook Form
- **Testing**: Vitest + React Testing Library + Playwright + pgTAP (Phase 6)
- **Deployment**: Vercel + GitHub Actions CI

---

## 🏛️ Architecture Summary

```
AI Business Command Center
├── app/
│   ├── (app)/               # Protected application workspace layout & routes
│   │   ├── dashboard/       # Executive Command Center (metrics, charts, insights)
│   │   ├── leads/           # Prospect ingestion & qualification (Phase 2)
│   │   ├── customers/       # 360-degree account directory (Phase 2)
│   │   ├── deals/           # Multi-stage Kanban pipeline (Phase 3)
│   │   ├── tasks/           # Granular operational task queue (Phase 3)
│   │   ├── activities/      # Immutable organization audit log (Phase 2)
│   │   ├── ai/              # Interactive AI assistant console (Phase 5)
│   │   └── settings/        # Workspace administration & API keys (Phase 1)
│   ├── (auth)/              # Authentication route group (login, register, callback)
│   ├── api/                 # Next.js Route Handlers (AI streaming, tool actions)
│   ├── layout.tsx           # Global HTML root layout & typography
│   ├── page.tsx             # Public marketing landing page
│   ├── loading.tsx          # Reusable root loading state
│   ├── error.tsx            # Global error boundary
│   └── not-found.tsx        # Branded 404 page
├── components/
│   ├── ui/                  # 15 shadcn/ui base primitives
│   ├── layouts/             # AppSidebar, AppTopbar, MobileNav
│   ├── shared/              # PageHeader, EmptyState, LoadingSpinner
│   └── features/dashboard/  # MetricCards, PipelineChart, Activity, Tasks, AIInsights
├── lib/
│   ├── mock/                # Typed static mock data structured for Supabase replacement
│   └── utils.ts             # Tailwind className merger (cn)
├── hooks/                   # Custom reusable React hooks
├── supabase/
│   ├── migrations/          # 17 ordered SQL migrations (Phase 1+)
│   └── tests/database/      # pgTAP automated RLS test suite (Phase 1+)
└── proxy.ts                 # Next.js 16 proxy convention for session token refresh
```

### Key Architectural Tenets
1. **Multi-Tenant Isolation**: Enforced by PostgreSQL Row-Level Security where every business table is keyed by `organization_id`. Helper functions in a private schema guarantee cross-tenant leakage is mathematically impossible.
2. **Supervised AI Tools**: The AI assistant cannot execute blind write mutations. Tool requests (e.g. updating deal stage, reassigning leads) are staged in `ai_pending_actions` and require explicit human supervisor approval.
3. **Dual-Mode AI Engine**: Supports `AI_MODE="mock"` for zero-cost local development and testing, and `AI_MODE="live"` with dynamically configured Anthropic Claude or OpenAI models.

---

## 🗺️ Development Phases

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 0** | **Project Foundation, Design System, Landing Page & App Shell** | **✅ Completed** |
| **Phase 1** | Supabase Auth, PostgreSQL Migrations, RLS Policies & Org Multi-Tenancy | ⏳ Next |
| **Phase 2** | Leads, Customers & Immutable Activity Audit Log | ⏳ Planned |
| **Phase 3** | Deals Pipeline (Kanban) & Explicitly-Linked Tasks | ⏳ Planned |
| **Phase 4** | Real-Time Dashboard Analytics with Supabase Aggregations | ⏳ Planned |
| **Phase 5** | Vercel AI SDK 7.0 Streaming, Tool Calling & Write Approvals | ⏳ Planned |
| **Phase 6** | Comprehensive Test Suite (Vitest, RTL, Playwright, pgTAP) & CI | ⏳ Planned |
| **Phase 7** | Production Deployment to Vercel & Performance Optimization | ⏳ Planned |

---

## ⚙️ Local Setup & Getting Started

### Prerequisites
- Node.js `20.9.0+` (or `22+`)
- npm `10+`

### 1. Clone & Install Dependencies
```bash
# Navigate to project directory
cd ai-business-command-center

# Install dependencies
npm install
```

### 2. Configure Environment
Copy the environment template:
```bash
cp .env.example .env.local
```
*(In Phase 0, all features run with local static demo data. Real API keys are not required until Phase 1 & 5).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- Landing Page: `http://localhost:3000/`
- Command Center Dashboard: `http://localhost:3000/dashboard`
- Leads Preview: `http://localhost:3000/leads`
- Deals Preview: `http://localhost:3000/deals`
- Tasks Preview: `http://localhost:3000/tasks`
- AI Assistant Preview: `http://localhost:3000/ai`

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 📄 License & Attribution
Portfolio and engineering learning project by Ishan Sharma.
