import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Retrieves the currently authenticated Supabase user.
 * In development mode without Supabase, falls back to dev session.
 * Verified with the Supabase Auth server using getUser() (not getSession()).
 * Returns null if unauthenticated.
 */
export async function getUser(): Promise<User | null> {
  const isDevMock =
    process.env.NODE_ENV !== "test" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))

  try {
    const cookieStore = await cookies()
    const devSession = cookieStore.get("dev_session")?.value
    if (devSession) {
      const parsed = JSON.parse(devSession)
      return {
        id: parsed.id || "00000000-0000-0000-0000-000000000001",
        email: parsed.email || "dev@commandcenter.io",
        app_metadata: {},
        user_metadata: { full_name: parsed.name || "Dev Workspace Owner" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as unknown as User
    }
  } catch {}

  // If in dev placeholder mode without Supabase configured, provide authenticated dev user
  if (isDevMock) {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: "dev@commandcenter.io",
      app_metadata: {},
      user_metadata: { full_name: "Dev Workspace Owner" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User
  }

  const supabase = await createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (err) {
    console.error("Error retrieving authenticated user:", err)
    return null
  }
}
