import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

/**
 * Retrieves the currently authenticated Supabase user.
 * Verified with the Supabase Auth server using getUser() (not getSession()).
 * Returns null if unauthenticated.
 */
export async function getUser(): Promise<User | null> {
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
