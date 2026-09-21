import { LandingNavbar } from "@/components/features/landing/landing-navbar"
import { HeroSection } from "@/components/features/landing/hero-section"
import { ScrollStorySection } from "@/components/features/landing/scroll-story-section"
import { BeforeAfterBanner } from "@/components/features/landing/before-after-banner"
import { CRMIntelligenceSection } from "@/components/features/landing/crm-intelligence-section"
import { AICopilotSection } from "@/components/features/landing/ai-copilot-section"
import { RAGKnowledgeSection } from "@/components/features/landing/rag-knowledge-section"
import { ProactiveInsightsSection } from "@/components/features/landing/proactive-insights-section"
import { HumanControlSection } from "@/components/features/landing/human-control-section"
import { SecuritySection } from "@/components/features/landing/security-section"
import { InteractiveDemo } from "@/components/features/landing/interactive-demo"
import { CTASection } from "@/components/features/landing/cta-section"
import { LandingFooter } from "@/components/features/landing/landing-footer"

export const metadata = {
  title: "AI Business Command Center — Your Business. One Intelligent Command Center.",
  description:
    "Keep your leads, customers, deals, tasks and business knowledge in one place — and let AI help you understand what needs attention.",
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      {/* 1. Sticky Navigation Header */}
      <LandingNavbar />

      <main className="flex-1 space-y-0">
        {/* 2. Hero — Immediate Understanding & 3D Mouse Parallax */}
        <HeroSection />

        {/* 3. The Problem & Solution Journey — "What gets easier?" */}
        <ScrollStorySection />

        {/* 4. "What It Solves" Continuous Comparison Marquee */}
        <BeforeAfterBanner />

        {/* 5. One Place for Your Business (Leads, Customers, Deals, Tasks, Activity, Knowledge) */}
        <CRMIntelligenceSection />

        {/* 6. AI Copilot — "Ask your business anything." */}
        <AICopilotSection />

        {/* 7. Business Knowledge — "Your AI knows your business." */}
        <RAGKnowledgeSection />

        {/* 8. Proactive Insights — "Don't wait for problems to find you." */}
        <ProactiveInsightsSection />

        {/* 9. AI Actions + Human Control — "AI helps. You stay in control." */}
        <HumanControlSection />

        {/* 10. Security & Trust — "Private. Secure. Built for your business." */}
        <SecuritySection />

        {/* 11. Interactive Live Demonstration (Client Sandbox) */}
        <InteractiveDemo />

        {/* 12. Final Call-to-Action */}
        <CTASection />
      </main>

      {/* 13. Professional Footer */}
      <LandingFooter />
    </div>
  )
}
