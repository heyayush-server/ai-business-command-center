import { createClient } from "@/lib/supabase/server"
import { generateEmbedding } from "./embeddings.service"

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

export type DocumentUploadArgs = {
  organizationId: string
  userId: string
  file: File
}

export async function uploadAndProcessDocument({ organizationId, userId, file }: DocumentUploadArgs) {
  const supabase = await createClient()

  // Validate file type
  const allowedMimeTypes = ["application/pdf", "text/plain", "text/markdown"]
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed: PDF, TXT, Markdown.`)
  }

  // File size limit (e.g. 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error(`File is too large. Max size is 10MB.`)
  }

  // 1. Create DB record first (pending state)
  const { data: docRecord, error: docError } = await supabase
    .from("knowledge_documents")
    .insert({
      organization_id: organizationId,
      uploaded_by: userId,
      filename: file.name,
      title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension for title
      mime_type: file.type,
      file_size: file.size,
      storage_path: "", // temporary
      status: "pending",
    })
    .select()
    .single()

  if (docError || !docRecord) {
    throw new Error(`Failed to create document record: ${docError?.message}`)
  }

  const documentId = docRecord.id
  const storagePath = `${organizationId}/${documentId}/${file.name}`

  // 2. Upload to Storage
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  const { error: storageError } = await supabase.storage
    .from("knowledge")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (storageError) {
    // Cleanup DB record if upload fails
    await supabase.from("knowledge_documents").delete().eq("id", documentId)
    throw new Error(`Failed to upload file to storage: ${storageError.message}`)
  }

  // Update storage path and status
  await supabase
    .from("knowledge_documents")
    .update({ storage_path: storagePath, status: "processing" })
    .eq("id", documentId)

  // 3. Process the document
  // In a real app with large files, this should be sent to a background worker.
  // For MVP, synchronous processing is acceptable.
  try {
    let extractedText = ""

    if (file.type === "application/pdf") {
      const pdfParse = require("pdf-parse")
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } else {
      // Text or Markdown
      extractedText = buffer.toString("utf-8")
    }

    if (!extractedText || extractedText.trim() === "") {
      throw new Error("Could not extract any text from the document.")
    }

    // Clean text (remove excessive whitespace)
    extractedText = extractedText.replace(/\s+/g, " ").trim()

    // 4. Chunk text
    const chunks = chunkText(extractedText, CHUNK_SIZE, CHUNK_OVERLAP)

    // 5. Generate embeddings and store
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i]
      const embedding = await generateEmbedding(chunkContent)
      
      const { error: chunkError } = await supabase
        .from("knowledge_chunks")
        .insert({
          organization_id: organizationId,
          document_id: documentId,
          content: chunkContent,
          chunk_index: i,
          // pgvector requires array string format or array representation
          embedding: `[${embedding.join(",")}]`,
          metadata: {
            title: docRecord.title,
            filename: docRecord.filename
          }
        })

      if (chunkError) {
        throw new Error(`Failed to insert chunk ${i}: ${chunkError.message}`)
      }
    }

    // 6. Mark as processed
    await supabase
      .from("knowledge_documents")
      .update({ status: "processed" })
      .eq("id", documentId)

  } catch (error: any) {
    // 7. Mark as failed if error occurs
    await supabase
      .from("knowledge_documents")
      .update({ 
        status: "failed", 
        error_message: error?.message || "Unknown processing error" 
      })
      .eq("id", documentId)
      
    throw error
  }
}

export async function getDocuments(organizationId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("*")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export async function deleteDocument(organizationId: string, documentId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("knowledge_documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", documentId)
    .eq("organization_id", organizationId)
    
  if (error) throw new Error(error.message)
}

export async function searchKnowledge(organizationId: string, query: string, limit: number = 5) {
  const supabase = await createClient()
  
  // Embed the query
  const queryEmbedding = await generateEmbedding(query)
  
  // Call RPC
  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: `[${queryEmbedding.join(",")}]`,
    match_count: limit,
    p_organization_id: organizationId
  })
  
  if (error) {
    console.error("Knowledge search error:", error)
    throw new Error(`Semantic search failed: ${error.message}`)
  }
  
  return data || []
}

/**
 * Basic recursive character-like text chunker
 */
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (text.length <= chunkSize) return [text]
  
  const chunks: string[] = []
  let startIndex = 0
  
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize
    
    // If we're not at the end of the text, try to find a nice breaking point
    if (endIndex < text.length) {
      // Look back for a period
      const lastPeriod = text.lastIndexOf(". ", endIndex)
      const lastNewline = text.lastIndexOf("\n", endIndex)
      
      // Break at newline or period if they are reasonably close to the end (within overlap zone)
      if (lastNewline > startIndex + chunkSize - overlap) {
        endIndex = lastNewline + 1
      } else if (lastPeriod > startIndex + chunkSize - overlap) {
        endIndex = lastPeriod + 2
      } else {
        // Look for a space if no punctuation
        const lastSpace = text.lastIndexOf(" ", endIndex)
        if (lastSpace > startIndex + chunkSize - overlap) {
          endIndex = lastSpace + 1
        }
      }
    }
    
    chunks.push(text.slice(startIndex, endIndex).trim())
    
    // Advance start index, accounting for overlap
    startIndex = endIndex - overlap
  }
  
  return chunks
}
