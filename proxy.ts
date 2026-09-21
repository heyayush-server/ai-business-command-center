import { NextResponse, type NextRequest } from "next/server"

/**
 * Next.js 16 Proxy Convention
 *
 * In Next.js 16+, `proxy.ts` replaces deprecated `middleware.ts` for edge request
 * interception and session token refresh.
 *
 * NOTE: As established in Architecture v2, this proxy is NOT the primary security
 * boundary (the PostgreSQL RLS and Server Actions are the security boundaries).
 * In Phase 1, this will handle Supabase session cookie refresh via @supabase/ssr.
 */
export function proxy(request: NextRequest) {
  // Pass-through for Phase 0 static/demo mode
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
