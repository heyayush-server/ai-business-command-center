import { LandingNavbar } from "@/components/features/landing/landing-navbar"
import { HeroSection } from "@/components/features/landing/hero-section"
import { InteractiveDemo } from "@/components/features/landing/interactive-demo"
import { ScrollStorySection } from "@/components/features/landing/scroll-story-section"
import { CRMIntelligenceSection } from "@/components/features/landing/crm-intelligence-section"
import { ProactiveInsightsSection } from "@/components/features/landing/proactive-insights-section"
import { RAGKnowledgeSection } from "@/components/features/landing/rag-knowledge-section"
import { SecuritySection } from "@/components/features/landing/security-section"
import { CTASection } from "@/components/features/landing/cta-section"
import { LandingFooter } from "@/components/features/landing/landing-footer"

export const metadata = {
  title: "AI Business Command Center — Autonomous SaaS Operations & AI Copilot",
  description:
    "Enterprise-grade business operations platform synthesizing leads, visual deal pipelines, task orchestration, pgvector RAG, and proactive business intelligence with human supervisory approval.",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* 1. Sticky Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 space-y-0">
        {/* 2. High-Impact Hero with 3D Mouse Tilt Parallax */}
        <HeroSection />

        {/* 3. Live Interactive Product Demonstration (Client Sandbox) */}
        <InteractiveDemo />

        {/* 4. Scroll-Based Product Story (Silos → Foundation → Proactive Intelligence → Supervised Action) */}
        <ScrollStorySection />

        {/* 5. Core CRM Intelligence Suite */}
        <CRMIntelligenceSection />

        {/* 6. Proactive Business Intelligence & Deterministic Signals (Phase 14) */}
        <ProactiveInsightsSection />

        {/* 7. Grounded RAG Knowledge Base (Phase 12) */}
        <RAGKnowledgeSection />

        {/* 8. Zero-Trust PostgreSQL Row-Level Security Architecture */}
        <SecuritySection />

        {/* 9. Final Call-to-Action */}
        <CTASection />
      </main>

      {/* 10. Professional Engineering Footer */}
      <LandingFooter />
    </div>
  )
}
