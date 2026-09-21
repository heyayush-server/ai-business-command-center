import { embed } from "ai"
import { openai } from "@ai-sdk/openai"

const EMBEDDING_PROVIDER = process.env.EMBEDDING_PROVIDER || "mock"
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small"
const EMBEDDING_DIMENSION = parseInt(process.env.EMBEDDING_DIMENSION || "1536", 10)

/**
 * Generate a deterministic pseudo-random number based on a string and seed.
 */
function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0
    let t = (a + b) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    d = (d + 1) | 0
    t = (t + d) | 0
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

/**
 * Generates a deterministic mock embedding vector for a given text.
 * The vector length will strictly match EMBEDDING_DIMENSION.
 * Normalizes the vector to length 1 to simulate cosine similarity properly.
 */
export function generateMockEmbedding(text: string, dimension: number = EMBEDDING_DIMENSION): number[] {
  const seed = hashString(text)
  const rand = sfc32(seed, seed ^ 0xdeadbeef, seed ^ 0x8badf00d, seed ^ 0xbad1dea)
  
  const vector = new Array(dimension)
  let sumSquares = 0
  
  for (let i = 0; i < dimension; i++) {
    // Generate values between -1 and 1
    const val = rand() * 2 - 1
    vector[i] = val
    sumSquares += val * val
  }
  
  const magnitude = Math.sqrt(sumSquares)
  // Normalize
  for (let i = 0; i < dimension; i++) {
    vector[i] = vector[i] / magnitude
  }
  
  return vector
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (EMBEDDING_PROVIDER === "mock") {
    // Small artificial delay to mimic network request
    await new Promise((resolve) => setTimeout(resolve, 50))
    return generateMockEmbedding(text)
  }

  // Handle live AI providers
  if (EMBEDDING_PROVIDER === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set but EMBEDDING_PROVIDER is 'openai'")
    }
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text,
    })
    return embedding
  }

  throw new Error(`Unsupported EMBEDDING_PROVIDER: ${EMBEDDING_PROVIDER}`)
}
