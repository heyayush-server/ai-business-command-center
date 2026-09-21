import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

/**
 * Next.js 16 Proxy Convention
 *
 * Replaces deprecated middleware.ts.
 * Intercepts requests to:
 * 1. Refresh Supabase auth session cookies
 * 2. Redirect unauthenticated users from protected application routes
 * 3. Redirect authenticated users away from auth screens
 * 4. Apply core security headers
 *
 * NOTE: Proxy is NOT the final security boundary.
 * Server Actions, Server Components, and PostgreSQL RLS remain the true security layer.
 */
export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")

  // Only enforce strict redirects if Supabase is actually configured
  if (supabaseConfigured) {
    const isAuthRoute =
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password")

    const isProtectedRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/leads") ||
      pathname.startsWith("/customers") ||
      pathname.startsWith("/deals") ||
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/activities") ||
      pathname.startsWith("/ai") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/onboarding")

    // Redirect unauthenticated users from protected areas
    if (!user && isProtectedRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users away from login/register
    if (user && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (.svg, .png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
