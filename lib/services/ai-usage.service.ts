import { createClient } from "@/lib/supabase/server"

const DEFAULT_DAILY_LIMIT = 50

export interface UsageCheckResult {
  allowed: boolean
  remaining: number
  limit: number
}

/**
 * Checks if the user has remaining AI request quota for today.
 */
export async function checkUsageLimit(
  organizationId: string,
  userId: string
): Promise<UsageCheckResult> {
  const limit = parseInt(process.env.AI_DAILY_REQUEST_LIMIT || `${DEFAULT_DAILY_LIMIT}`, 10)
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .gte("created_at", todayStart.toISOString())

  if (error) {
    console.error("[ai-usage.service] Error checking usage:", error)
    // Fail open for transient DB count errors so users aren't blocked
    return { allowed: true, remaining: limit, limit }
  }

  const used = count || 0
  const remaining = Math.max(0, limit - used)

  return {
    allowed: used < limit,
    remaining,
    limit,
  }
}

/**
 * Records token consumption and request metadata into ai_usage.
 */
export async function recordUsageTokens({
  organizationId,
  userId,
  model,
  provider,
  promptTokens = 0,
  completionTokens = 0,
}: {
  organizationId: string
  userId: string
  model: string
  provider: string
  promptTokens?: number
  completionTokens?: number
}) {
  const supabase = await createClient()

  const totalTokens = promptTokens + completionTokens

  const { error } = await supabase.from("ai_usage").insert({
    organization_id: organizationId,
    user_id: userId,
    model,
    provider,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
  })

  if (error) {
    console.error("[ai-usage.service] Error recording usage:", error)
  }
}
