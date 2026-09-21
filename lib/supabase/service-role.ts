import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

/**
 * Service Role Supabase Client
 *
 * SERVER-ONLY. Bypasses PostgreSQL Row-Level Security.
 * Uses the secret SUPABASE_SERVICE_ROLE_KEY.
 *
 * ONLY for operations that cannot run under user context:
 * - Approved AI write execution (inserting into activities / audit log)
 * - Automated system maintenance
 * - Token usage logging
 *
 * NEVER import into Client Components or expose to the browser.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return createSupabaseClient<Database>(
      supabaseUrl || "https://placeholder-project.supabase.co",
      serviceRoleKey || "placeholder-service-role-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
