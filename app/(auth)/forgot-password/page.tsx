"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { requestPasswordReset, type AuthActionResult } from "@/lib/actions/auth"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = React.useActionState(
    requestPasswordReset,
    null as AuthActionResult | null
  )

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">Reset your password</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your verified email address to receive a secure password recovery link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state?.success ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Check your inbox</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.message}
              </p>
            </div>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", className: "w-full text-xs" })}
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            {state?.error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground border-t pt-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Back to sign in</span>
        </Link>
      </CardFooter>
    </Card>
  )
}
