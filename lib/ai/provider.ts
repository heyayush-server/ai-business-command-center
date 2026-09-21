import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"

/**
 * Determines if AI is operating in mock mode.
 * Defaults to true if AI_MODE=mock or if neither API key is configured.
 */
export function isAIMockMode(): boolean {
  if (process.env.AI_MODE === "mock") {
    return true
  }
  const provider = process.env.AI_PROVIDER || "anthropic"
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
  const provider = process.env.AI_PROVIDER || "anthropic"
  if (provider === "anthropic") {
    return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
  }
  return process.env.OPENAI_MODEL || "gpt-4o"
}

/**
 * Returns the configured provider model object for streamText.
 */
export function getAIModel() {
  const provider = process.env.AI_PROVIDER || "anthropic"

  if (provider === "anthropic") {
    const modelId = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514"
    return anthropic(modelId)
  }

  const modelId = process.env.OPENAI_MODEL || "gpt-4o"
  return openai(modelId)
}
