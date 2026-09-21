"use client"

import { useState, useRef } from "react"
import { uploadDocumentAction, deleteDocumentAction } from "@/lib/actions/knowledge.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, FileUp, Loader2 } from "lucide-react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function KnowledgeClient({ initialDocuments }: { initialDocuments: any[] }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const result = await uploadDocumentAction(formData)
      if (!result.success) {
        setError(result.error || "Failed to upload document")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setError((error as Error).message || "An unexpected error occurred")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return
    
    const result = await deleteDocumentAction(documentId)
    if (!result.success) {
      alert("Failed to delete document: " + result.error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept=".pdf,.txt,.md"
          className="hidden" 
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
          {isUploading ? "Processing..." : "Upload Document"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Filename</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Uploaded</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialDocuments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-muted-foreground">
                  No documents found. Upload a document to get started.
                </td>
              </tr>
            ) : (
              initialDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{doc.filename}</td>
                  <td className="px-4 py-3">{doc.mime_type}</td>
                  <td className="px-4 py-3">{formatFileSize(doc.file_size)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      doc.status === "processed" ? "default" :
                      doc.status === "failed" ? "destructive" : "secondary"
                    }>
                      {doc.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
