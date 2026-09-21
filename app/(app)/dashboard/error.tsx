"use client"

import React, { useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[DashboardError]", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-border bg-card shadow-sm">
        <CardContent className="p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Unable to load dashboard intelligence
            </h3>
            <p className="text-xs text-muted-foreground">
              {error.message || "An unexpected error occurred while fetching organization metrics."}
            </p>
          </div>
          <Button onClick={reset} size="sm" className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
