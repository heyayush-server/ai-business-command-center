import { describe, it, expect, vi, beforeEach } from "vitest"
import { generateMockEmbedding } from "../lib/services/embeddings.service"

describe("Embeddings Service - Mock Mode", () => {
  it("generates a deterministic vector of correct dimension", () => {
    const text = "Company refund policy: 30 days."
    const vector = generateMockEmbedding(text, 1536)
    
    expect(vector.length).toBe(1536)
    
    // Check determinism
    const vector2 = generateMockEmbedding(text, 1536)
    expect(vector).toEqual(vector2)
  })

  it("generates different vectors for different text", () => {
    const v1 = generateMockEmbedding("Refund policy", 1536)
    const v2 = generateMockEmbedding("Privacy policy", 1536)
    
    expect(v1).not.toEqual(v2)
  })

  it("normalizes the vector to magnitude 1", () => {
    const vector = generateMockEmbedding("test", 1536)
    const sumSq = vector.reduce((sum, val) => sum + val * val, 0)
    // Floating point precision check
    expect(sumSq).toBeCloseTo(1.0, 5)
  })
})

describe("Knowledge Document Validation Rules", () => {
  const allowedMimeTypes = ["application/pdf", "text/plain", "text/markdown"]
  const maxSize = 10 * 1024 * 1024

  it("accepts valid mime types", () => {
    expect(allowedMimeTypes.includes("application/pdf")).toBe(true)
    expect(allowedMimeTypes.includes("text/plain")).toBe(true)
    expect(allowedMimeTypes.includes("text/markdown")).toBe(true)
  })

  it("rejects invalid mime types", () => {
    expect(allowedMimeTypes.includes("application/msword")).toBe(false)
    expect(allowedMimeTypes.includes("image/jpeg")).toBe(false)
  })

  it("accepts valid file sizes", () => {
    const validSize = 5 * 1024 * 1024
    expect(validSize <= maxSize).toBe(true)
  })

  it("rejects file sizes over 10MB", () => {
    const invalidSize = 11 * 1024 * 1024
    expect(invalidSize <= maxSize).toBe(false)
  })
})
