"use client"

import React, { useState, useTransition } from "react"
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  Zap,
  FileText,
  Users,
  Building2,
  TrendingUp,
  ListTodo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approveAiActionAction, cancelAiActionAction } from "@/lib/actions/ai-actions.actions"
import type { AIActionType } from "@/lib/ai/action-definitions"
import type { ActionPreview } from "@/lib/ai/action-definitions"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PendingActionCardData {
  actionId: string
  actionType: AIActionType
  status: string
  expiresAt: string | null
  preview: ActionPreview
}

// ── Action icon helper ────────────────────────────────────────────────────────

function ActionIcon({ actionType }: { actionType: AIActionType }) {
  const cls = "h-4 w-4"
  if (actionType.includes("task")) return <ListTodo className={cls} />
  if (actionType.includes("lead")) return <Users className={cls} />
  if (actionType.includes("customer")) return <Building2 className={cls} />
  if (actionType.includes("deal")) return <TrendingUp className={cls} />
  return <FileText className={cls} />
}

// ── Action color helper ───────────────────────────────────────────────────────

function getActionColor(actionType: AIActionType) {
  if (actionType.includes("task")) return "text-violet-600 bg-violet-50 border-violet-200"
  if (actionType.includes("lead")) return "text-blue-600 bg-blue-50 border-blue-200"
  if (actionType.includes("customer")) return "text-emerald-600 bg-emerald-50 border-emerald-200"
  if (actionType.includes("deal")) return "text-amber-600 bg-amber-50 border-amber-200"
  return "text-slate-600 bg-slate-50 border-slate-200"
}

// ── Status badge ──────────────────────────────────────────────────────────────

type CardStatus = "pending" | "approved" | "executing" | "executed" | "cancelled" | "failed" | "expired"

function StatusBadge({ status }: { status: CardStatus }) {
  const cfg: Record<CardStatus, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
    pending: { label: "Awaiting Approval", variant: "outline" },
    approved: { label: "Approved", variant: "default" },
    executing: { label: "Executing…", variant: "secondary" },
    executed: { label: "Executed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "secondary" },
    failed: { label: "Failed", variant: "destructive" },
    expired: { label: "Expired", variant: "outline" },
  }
  const { label, variant } = cfg[status]
  return <Badge variant={variant} className="text-[10px] h-5">{label}</Badge>
}

// ── Main approval card component ──────────────────────────────────────────────

interface AIApprovalCardProps {
  data: PendingActionCardData
  /** Called after successful execution with the result message */
  onApproved?: (message: string) => void
  /** Called after cancellation */
  onCancelled?: () => void
}

export function AIApprovalCard({ data, onApproved, onCancelled }: AIApprovalCardProps) {
  const [cardStatus, setCardStatus] = useState<CardStatus>(
    data.status === "pending" ? "pending" : (data.status as CardStatus)
  )
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPendingApprove, startApproveTransition] = useTransition()
  const [isPendingCancel, startCancelTransition] = useTransition()

  const isExpired = data.expiresAt ? new Date(data.expiresAt) < new Date() : false
  const isFinalState = ["executed", "cancelled", "failed", "expired"].includes(cardStatus)

  const handleApprove = () => {
    startApproveTransition(async () => {
      setCardStatus("executing")
      setErrorMessage(null)
      const result = await approveAiActionAction(data.actionId)
      if (result.success) {
        setCardStatus("executed")
        setResultMessage(result.message)
        onApproved?.(result.message)
      } else {
        const expired = result.message.toLowerCase().includes("expired")
        setCardStatus(expired ? "expired" : "failed")
        setErrorMessage(result.message)
      }
    })
  }

  const handleCancel = () => {
    startCancelTransition(async () => {
      setErrorMessage(null)
      const result = await cancelAiActionAction(data.actionId)
      if (result.success) {
        setCardStatus("cancelled")
        setResultMessage("Action cancelled.")
        onCancelled?.()
      } else {
        setErrorMessage(result.message)
      }
    })
  }

  const colorClass = getActionColor(data.actionType)

  return (
    <div
      className={`my-2 rounded-xl border bg-card shadow-sm overflow-hidden max-w-sm ${
        isFinalState ? "opacity-80" : ""
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2.5 px-3.5 py-2.5 border-b ${colorClass}`}>
        <div className="flex-shrink-0">
          <ActionIcon actionType={data.actionType} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate">{data.preview.label}</p>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={isExpired && cardStatus === "pending" ? "expired" : cardStatus} />
        </div>
      </div>

      {/* Field list */}
      {data.preview.fields.length > 0 && (
        <div className="px-3.5 py-2.5 space-y-1.5">
          {data.preview.fields.map((field) => (
            <div key={field.key} className="flex items-start gap-2 text-xs">
              <span className="text-muted-foreground min-w-[80px] shrink-0">{field.key}:</span>
              <span className="font-medium text-foreground break-words">{field.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Result / Error messages */}
      {(resultMessage || errorMessage) && (
        <div
          className={`mx-3.5 mb-2.5 rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${
            resultMessage
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {resultMessage ? (
            <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          )}
          <span>{resultMessage ?? errorMessage}</span>
        </div>
      )}

      {/* Expiry note */}
      {!isFinalState && data.expiresAt && !isExpired && cardStatus === "pending" && (
        <div className="px-3.5 pb-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Expires {new Date(data.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {cardStatus === "pending" && !isExpired && (
        <div className="flex items-center gap-2 px-3.5 pb-3.5">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5"
            onClick={handleApprove}
            disabled={isPendingApprove || isPendingCancel}
            id={`approve-action-${data.actionId}`}
          >
            {isPendingApprove ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {isPendingApprove ? "Executing…" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs gap-1.5"
            onClick={handleCancel}
            disabled={isPendingApprove || isPendingCancel}
            id={`cancel-action-${data.actionId}`}
          >
            {isPendingCancel ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Cancel
          </Button>
        </div>
      )}

      {/* Executed success state */}
      {cardStatus === "executed" && (
        <div className="px-3.5 pb-3 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Action completed successfully</span>
        </div>
      )}

      {/* Cancelled / Expired state */}
      {(cardStatus === "cancelled" || cardStatus === "expired") && (
        <div className="px-3.5 pb-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <XCircle className="h-3.5 w-3.5" />
          <span>{cardStatus === "cancelled" ? "Action was cancelled" : "Action expired"}</span>
        </div>
      )}
    </div>
  )
}
