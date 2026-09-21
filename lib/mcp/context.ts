export interface MCPContext {
  organizationId: string
  userId: string
  role: string // "owner" | "admin" | "member" | "viewer"
  conversationId?: string | null
}
