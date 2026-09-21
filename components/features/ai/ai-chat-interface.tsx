"use client"

import React, { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { TextStreamChatTransport, type UIMessage } from "ai"
import {
  Bot,
  User,
  Send,
  Square,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Wrench,
  ChevronRight,
  TrendingUp,
  Users,
  Building2,
  ListTodo,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AIApprovalCard } from "@/components/features/ai/ai-approval-card"
import type { AIActionType } from "@/lib/ai/action-definitions"

interface AIChatInterfaceProps {
  organizationName: string
  userName?: string | null
  initialMessages?: UIMessage[]
  conversationId?: string
}

const SUGGESTED_PROMPTS = [
  {
    label: "Give me a business overview",
    icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
  },
  {
    label: "What deals need attention?",
    icon: <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />,
  },
  {
    label: "Show me overdue tasks",
    icon: <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
  },
  {
    label: "Create a follow-up task for tomorrow",
    icon: <Plus className="h-3.5 w-3.5 text-violet-500" />,
  },
  {
    label: "Which leads are qualified?",
    icon: <Users className="h-3.5 w-3.5 text-blue-500" />,
  },
  {
    label: "Summarize my pipeline",
    icon: <Building2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
  {
    label: "Create a new customer account",
    icon: <Building2 className="h-3.5 w-3.5 text-teal-500" />,
  },
  {
    label: "Log a call activity",
    icon: <ListTodo className="h-3.5 w-3.5 text-amber-500" />,
  },
]

// ── Helpers to extract pending actions from message parts ─────────────────────

interface ParsedPendingAction {
  actionId: string
  actionType: AIActionType
  status: string
  expiresAt: string | null
  preview: {
    label: string
    actionType: AIActionType
    fields: Array<{ key: string; value: string | null | undefined }>
  }
}

function extractPendingActions(message: UIMessage): ParsedPendingAction[] {
  const actions: ParsedPendingAction[] = []
  if (!Array.isArray(message.parts)) return actions

  for (const part of message.parts) {
    // Tool output parts carry the result from the server tool execute fn
    if (
      "type" in part &&
      (part.type === "tool-invocation" || part.type === "tool-result" || part.type === "tool-output")
    ) {
      // In AI SDK 7, the tool result is in the part itself or a nested result field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = (part as any).output ?? (part as any).result ?? (part as any).toolResult
      if (
        output &&
        typeof output === "object" &&
        "actionId" in output &&
        "actionType" in output &&
        "preview" in output
      ) {
        actions.push(output as ParsedPendingAction)
      }
    }
  }

  return actions
}

export function AIChatInterface({
  organizationName,
  userName,
  initialMessages = [],
  conversationId,
}: AIChatInterfaceProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    sendMessage,
    stop,
    status,
    error,
    clearError,
    setMessages,
  } = useChat({
    messages: initialMessages,
    transport: new TextStreamChatTransport({
      api: "/api/ai/chat",
      body: conversationId ? { conversationId } : undefined,
    }),
  })

  const isLoading = status === "submitted" || status === "streaming"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, status])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isLoading) return

    setInput("")
    clearError()

    try {
      await sendMessage({ text })
    } catch (err) {
      console.error("[AIChatInterface] Error sending message:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    setInput("")
    clearError()
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Track cards that have been approved/cancelled so we can show inline feedback
  const [approvedCards, setApprovedCards] = useState<Record<string, string>>({})
  const [cancelledCards, setCancelledCards] = useState<Set<string>>(new Set())

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
      {/* Top Console Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold text-foreground">
                AI Business Assistant
              </h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                Actions Enabled
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Operating within {organizationName} • Human approval required for writes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="text-xs h-7 gap-1 px-2.5"
            disabled={isLoading && messages.length === 0}
          >
            <RefreshCw className="h-3 w-3" />
            <span>New Chat</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center py-8 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">
                Welcome, {userName || "Executive"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ask me questions about {organizationName}&apos;s data, or ask me to create leads, tasks, customers, or deals. Write actions require your approval before executing.
              </p>
            </div>

            {/* Suggested Prompts Grid */}
            <div className="w-full space-y-2 pt-2">
              <span className="text-[11px] font-medium text-muted-foreground block text-left">
                Try asking:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.label}
                    type="button"
                    onClick={() => handleSend(prompt.label)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2">
                      {prompt.icon}
                      <span className="text-xs font-medium text-foreground">
                        {prompt.label}
                      </span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user"

            // Extract text parts from UIMessage.parts (SDK 7 — no top-level content)
            let renderedText = ""
            const toolCalls: Array<{ name: string }> = []

            if (Array.isArray(message.parts)) {
              for (const part of message.parts) {
                if (part.type === "text") {
                  renderedText += part.text
                } else if (
                  "toolName" in part &&
                  typeof (part as { toolName?: unknown }).toolName === "string"
                ) {
                  toolCalls.push({
                    name: (part as { toolName: string }).toolName,
                  })
                }
              }
            }

            // Extract any pending actions from tool outputs
            const pendingActions = extractPendingActions(message)

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[90%] sm:max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  {/* Tool call badges (read queries) */}
                  {!isUser && toolCalls.filter(tc => !tc.name.startsWith("prepare_")).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {toolCalls.filter(tc => !tc.name.startsWith("prepare_")).map((tc, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 rounded bg-muted/70 px-2 py-0.5 text-[10px] font-mono border border-border/50 text-muted-foreground"
                        >
                          <Wrench className="h-2.5 w-2.5 text-primary" />
                          <span>Queried: {tc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prepare action badges */}
                  {!isUser && toolCalls.filter(tc => tc.name.startsWith("prepare_")).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {toolCalls.filter(tc => tc.name.startsWith("prepare_")).map((tc, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 rounded bg-violet-50 border border-violet-200 px-2 py-0.5 text-[10px] font-mono text-violet-700"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          <span>Prepared: {tc.name.replace("prepare_", "")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message bubble */}
                  {(renderedText || (isLoading && !isUser)) && (
                    <div
                      className={`rounded-2xl p-3.5 text-xs leading-relaxed ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-xs"
                          : "bg-muted/40 border border-border/70 text-foreground rounded-bl-xs shadow-2xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">
                        {renderedText ||
                          (isLoading && !isUser ? "Analyzing your request…" : "")}
                      </div>
                    </div>
                  )}

                  {/* Approval cards from tool outputs */}
                  {!isUser &&
                    pendingActions.map((action) => {
                      const wasApproved = approvedCards[action.actionId]
                      const wasCancelled = cancelledCards.has(action.actionId)
                      return (
                        <AIApprovalCard
                          key={action.actionId}
                          data={{
                            ...action,
                            status: wasCancelled
                              ? "cancelled"
                              : wasApproved
                              ? "executed"
                              : action.status,
                          }}
                          onApproved={(msg) =>
                            setApprovedCards((prev) => ({ ...prev, [action.actionId]: msg }))
                          }
                          onCancelled={() =>
                            setCancelledCards((prev) => new Set([...prev, action.actionId]))
                          }
                        />
                      )
                    })}
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Loading Indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-xs bg-muted/40 border border-border/70 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span>Processing…</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold">Unable to complete request</p>
              <p className="text-[11px] opacity-90">{error.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-[10px] h-6 px-2 text-destructive hover:bg-destructive/20"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 border-t border-border bg-background shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask questions or say 'Create a task…', 'Add a lead…', 'Log a meeting…'"
              rows={1}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-xs shadow-2xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring min-h-[38px] max-h-24"
            />
          </div>

          {isLoading ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => stop()}
              className="h-9 px-3 text-xs gap-1.5 shrink-0"
            >
              <Square className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              <span className="hidden sm:inline">Stop</span>
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="h-9 px-3.5 text-xs gap-1.5 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          )}
        </form>
        <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-muted-foreground">
          <span>Enter to send, Shift+Enter for new line</span>
          <span>Write actions require approval • Data stays in your org</span>
        </div>
      </div>
    </div>
  )
}
