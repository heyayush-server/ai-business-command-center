import { createClient } from "@/lib/supabase/server"
import { getUser } from "@/lib/auth/getUser"
import type { MemberRole } from "@/lib/types/database.types"

export interface CurrentOrganizationResult {
  organizationId: string
  organizationName: string
  organizationSlug: string
  userRole: MemberRole
}

/**
 * Resolves and validates the current organization context for the authenticated user.
 *
 * CRITICAL SECURITY TENET:
 * Never trusts unverified organization IDs from the client.
 * Always verifies that an active row exists in `organization_members`
 * matching both user_id and organization_id.
 */
export async function getCurrentOrganization(): Promise<CurrentOrganizationResult | null> {
  const user = await getUser()

  if (!user) {
    return null
  }

  const supabase = await createClient()

  // 1. Fetch user's active membership
  const { data: membership, error: memberError } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (memberError || !membership) {
    return null
  }

  // 2. Fetch corresponding organization verified by RLS
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("id", membership.organization_id)
    .maybeSingle()

  if (orgError || !org) {
    return null
  }

  return {
    organizationId: org.id,
    organizationName: org.name,
    organizationSlug: org.slug,
    userRole: membership.role as MemberRole,
  }
}
