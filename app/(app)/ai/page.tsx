import React from "react"
import { Bot, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function AIAssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Operational Assistant"
        description="Autonomous operations agent powered by Vercel AI SDK 7.0 with supervised tool execution."
        action={
          <Badge variant="outline" className="gap-1 px-2.5 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mock Engine Ready</span>
          </Badge>
        }
      />

      <div className="rounded-xl border border-border bg-card p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Interactive AI Console Preview</h3>
              <p className="text-xs text-muted-foreground">
                Streaming chat, tool approvals, and JSONB message parts will be implemented in Phase 5.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-mono">
            Vercel AI SDK 7.0
          </Badge>
        </div>

        <EmptyState
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          title="AI Assistant Chat Surface"
          description="In Phase 5, this surface will connect to /api/ai/chat with read queries, write actions staged in ai_pending_actions, and streaming responses."
          actionLabel="View Dashboard AI Insights"
          actionHref="/dashboard"
        />

        <div className="flex items-center gap-2 pt-2">
          <Input
            disabled
            placeholder="Ask the AI to analyze your pipeline, summarize deals, or draft actions..."
            className="text-xs"
          />
          <Button disabled size="sm" className="gap-1 h-9 px-4">
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
