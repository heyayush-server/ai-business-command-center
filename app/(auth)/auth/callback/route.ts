import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Supabase Auth Callback Route Handler
 *
 * Handles both OAuth redirects (Google OAuth) and Email confirmation magic links.
 * Exchanges the temporary auth code for an active session stored in HTTP-only cookies.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("OAuth code exchange failed:", error.message)
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    // Check if user has an organization membership
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle()

      // If user has no organization yet, direct to onboarding
      if (!member) {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    }
  }

  // Redirect to destination
  return NextResponse.redirect(new URL(next, request.url))
}
