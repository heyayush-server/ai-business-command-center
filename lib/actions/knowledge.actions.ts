"use server"

import { revalidatePath } from "next/cache"
import { uploadAndProcessDocument, deleteDocument } from "@/lib/services/knowledge.service"
import { getCurrentOrganization } from "@/lib/auth/getCurrentOrganization"
import { getUser } from "@/lib/auth/getUser"

export async function uploadDocumentAction(formData: FormData) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    
    const organization = await getCurrentOrganization()
    if (!organization) throw new Error("No active organization")
    
    const file = formData.get("file") as File
    if (!file) throw new Error("No file provided")
    
    await uploadAndProcessDocument({
      organizationId: organization.organizationId,
      userId: user.id,
      file,
    })
    
    revalidatePath("/knowledge")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteDocumentAction(documentId: string) {
  try {
    const user = await getUser()
    if (!user) throw new Error("Unauthorized")
    
    const organization = await getCurrentOrganization()
    if (!organization) throw new Error("No active organization")
    
    await deleteDocument(organization.organizationId, documentId)
    
    revalidatePath("/knowledge")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
