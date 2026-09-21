"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signUpWithPassword, signInWithGoogle, type AuthActionResult } from "@/lib/actions/auth"

export default function RegisterPage() {
  const [state, formAction, isPending] = React.useActionState(
    signUpWithPassword,
    null as AuthActionResult | null
  )
  const [isGooglePending, setIsGooglePending] = React.useState(false)
  const [googleError, setGoogleError] = React.useState<string | null>(null)

  const handleGoogleSignUp = async () => {
    try {
      setIsGooglePending(true)
      setGoogleError(null)
      const res = await signInWithGoogle()
      if (res?.error) {
        setGoogleError(res.error)
      }
    } catch {
      // Handled by redirect or error
    } finally {
      setIsGooglePending(false)
    }
  }

  const errorMessage = state?.error || googleError

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Deploy an isolated workspace with PostgreSQL Row-Level Security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state?.success && state.message ? (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Verify your email</h3>
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
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Ishan Sharma"
                  required
                  autoComplete="name"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ishan@company.com"
                  required
                  autoComplete="email"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isPending}
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be at least 8 characters with numbers or symbols.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={isPending}
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignUp}
              disabled={isGooglePending || isPending}
              className="w-full text-xs gap-2"
            >
              {isGooglePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign up with Google</span>
            </Button>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground border-t pt-4">
        <span>Already have an account? </span>
        <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
