import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/types/database.types"

/**
 * Browser Supabase Client
 *
 * For use in Client Components ONLY ("use client").
 * Uses singleton pattern so only one client instance exists in the browser.
 * Relies on document.cookie automatically managed by the browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Provide a descriptive error or placeholder for unconfigured environments
    return createBrowserClient<Database>(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseAnonKey || "placeholder-anon-key"
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
