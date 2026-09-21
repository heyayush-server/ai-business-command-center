import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"

export type SupportedAIProvider = "gemini" | "anthropic" | "openai"

/**
 * Resolves the configured AI provider.
 * Defaults to "gemini" if GEMINI_API_KEY is present, or otherwise follows AI_PROVIDER.
 */
export function getActiveProvider(): SupportedAIProvider {
  const configured = process.env.AI_PROVIDER?.toLowerCase()
  if (configured === "gemini" || configured === "anthropic" || configured === "openai") {
    return configured
  }
  if (process.env.GEMINI_API_KEY) {
    return "gemini"
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return "anthropic"
  }
  if (process.env.OPENAI_API_KEY) {
    return "openai"
  }
  return "gemini"
}

/**
 * Determines if AI is operating in mock mode.
 * Defaults to true if AI_MODE=mock or if the active provider's API key is not configured.
 */
export function isAIMockMode(): boolean {
  if (process.env.AI_MODE === "mock") {
    return true
  }
  const provider = getActiveProvider()
  if (provider === "gemini" && !process.env.GEMINI_API_KEY) {
    return true
  }
  if (provider === "anthropic" && !process.env.ANTHROPIC_API_KEY) {
    return true
  }
  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return true
  }
  return false
}

/**
 * Returns the active model identifier string for usage recording.
 */
export function getModelId(): string {
  if (isAIMockMode()) {
    return "mock-business-assistant"
  }
  const provider = getActiveProvider()
  if (provider === "gemini") {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash"
  }
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
  }
  return process.env.OPENAI_MODEL || "gpt-4o"
}

/**
 * Returns the configured provider model object for AI SDK streamText (Anthropic / OpenAI).
 */
export function getAIModel() {
  const provider = getActiveProvider()

  if (provider === "anthropic") {
    const modelId = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
    return anthropic(modelId)
  }

  const modelId = process.env.OPENAI_MODEL || "gpt-4o"
  return openai(modelId)
}
