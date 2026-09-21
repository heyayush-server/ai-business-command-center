import { tool } from "ai"
import { z } from "zod"
import { searchKnowledge } from "@/lib/services/knowledge.service"
import type { MCPContext } from "../context"

export function getKnowledgeTools(context: MCPContext) {
  const { organizationId } = context

  return {
    search_knowledge_base: tool({
      description: "Search the organization's uploaded knowledge base documents (e.g. SOPs, policies, guides) to answer company-specific questions.",
      inputSchema: z.object({
        query: z.string().describe("The semantic search query based on the user's question."),
        limit: z.number().int().min(1).max(10).default(5).describe("Maximum number of relevant document chunks to return."),
      }),
      execute: async ({ query, limit }) => {
        try {
          const results = await searchKnowledge(organizationId, query, limit)
          if (!results || results.length === 0) {
            return { results: [], message: "No relevant company knowledge found." }
          }
          return {
            results: results.map((r: Record<string, unknown>) => ({
              content: r.content,
              metadata: r.metadata,
              similarity: r.similarity
            }))
          }
        } catch (error: unknown) {
          console.error("[MCP:search_knowledge_base] Error:", error)
          return { error: "Failed to search knowledge base" }
        }
      },
    }),
  }
}
