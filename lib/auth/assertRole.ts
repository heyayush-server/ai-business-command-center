import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import type { MemberRole } from "@/lib/types/database.types"

/**
 * Server-side authorization guard.
 * Validates that the authenticated user belongs to an organization
 * and possesses one of the required roles.
 *
 * Throws an Error if unauthorized.
 */
export async function assertRole(allowedRoles: MemberRole[]): Promise<{
  organizationId: string
  userRole: MemberRole
}> {
  const currentOrg = await getCurrentOrganization()

  if (!currentOrg) {
    throw new Error("Unauthorized: User has no active organization membership.")
  }

  if (!allowedRoles.includes(currentOrg.userRole)) {
    throw new Error(
      `Forbidden: Required role [${allowedRoles.join(", ")}], but current role is "${currentOrg.userRole}".`
    )
  }

  return {
    organizationId: currentOrg.organizationId,
    userRole: currentOrg.userRole,
  }
}
