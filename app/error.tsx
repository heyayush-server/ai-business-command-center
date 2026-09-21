"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Something unexpected went wrong
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while processing your request. Please try again."}
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
        <a href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Return to Dashboard
        </a>
      </div>
    </div>
  )
}
