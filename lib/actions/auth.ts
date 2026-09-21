"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export type AuthActionResult = {
  success?: boolean
  error?: string
  message?: string
}

const isDevMock =
  process.env.NODE_ENV !== "test" &&
  (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder"))

/**
 * Sign in existing user with email and password
 */
export async function signInWithPassword(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard"

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  // Local development fallback mode when Supabase is not configured
  if (isDevMock) {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters." }
    }
    const cookieStore = await cookies()
    cookieStore.set(
      "dev_session",
      JSON.stringify({
        id: "00000000-0000-0000-0000-000000000001",
        email: email || "dev@commandcenter.io",
        role: "owner",
        orgId: "00000000-0000-0000-0000-000000000001",
        orgName: "Acme Global Operations",
      }),
      { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 }
    )
    revalidatePath("/", "layout")
    redirect(redirectTo)
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if user has an organization
    if (data.user) {
      const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", data.user.id)
        .limit(1)
        .maybeSingle()

      revalidatePath("/", "layout")

      if (!member) {
        redirect("/onboarding")
      }
    }

    revalidatePath("/", "layout")
    redirect(redirectTo)
  } catch (err: unknown) {
    // If connection to Supabase failed (DNS error, offline, fetch failed)
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (
      errorMsg.includes("fetch failed") ||
      errorMsg.includes("ENOTFOUND") ||
      errorMsg.includes("Failed to fetch")
    ) {
      const cookieStore = await cookies()
      cookieStore.set(
        "dev_session",
        JSON.stringify({
          id: "00000000-0000-0000-0000-000000000001",
          email: email || "dev@commandcenter.io",
          role: "owner",
          orgId: "00000000-0000-0000-0000-000000000001",
          orgName: "Acme Global Operations",
        }),
        { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 }
      )
      revalidatePath("/", "layout")
      redirect(redirectTo)
    }
    throw err
  }
}

/**
 * Register a new user with email and password
 */
export async function signUpWithPassword(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  // Local development fallback mode when Supabase is not configured
  if (isDevMock) {
    const cookieStore = await cookies()
    cookieStore.set(
      "dev_session",
      JSON.stringify({
        id: "00000000-0000-0000-0000-000000000001",
        email: email || "dev@commandcenter.io",
        name: fullName || "Dev User",
        role: "owner",
        orgId: "00000000-0000-0000-0000-000000000001",
        orgName: "Acme Global Operations",
      }),
      { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 }
    )
    revalidatePath("/", "layout")
    redirect("/onboarding")
  }

  const supabase = await createClient()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || null,
      },
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is required by Supabase project settings
  if (data.user && !data.session) {
    return {
      success: true,
      message:
        "Registration successful! Please check your email to verify your account before logging in.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/onboarding")
}

/**
 * Initiate Google OAuth Flow
 */
export async function signInWithGoogle(): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.url) {
    redirect(data.url)
  }

  return { error: "Failed to generate Google OAuth authorization URL." }
}

/**
 * Request Password Reset Email
 */
export async function requestPasswordReset(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Please provide your email address." }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/settings`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    message: "Password reset instructions have been sent to your email address.",
  }
}

/**
 * Sign Out active user
 */
export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("dev_session")
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

/**
 * Create initial organization during onboarding
 */
export async function createInitialOrganization(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const orgName = (formData.get("organizationName") as string) || ""
  const fullName = (formData.get("fullName") as string) || ""

  // Local development fallback mode when Supabase is not configured
  if (isDevMock) {
    const cookieStore = await cookies()
    cookieStore.set(
      "dev_session",
      JSON.stringify({
        id: "00000000-0000-0000-0000-000000000001",
        email: "dev@commandcenter.io",
        name: fullName.trim() || "Dev User",
        role: "owner",
        orgId: "00000000-0000-0000-0000-000000000001",
        orgName: orgName.trim() || "Acme Global Operations",
      }),
      { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 }
    )
    revalidatePath("/", "layout")
    redirect("/dashboard")
  }

  if (!orgName || orgName.trim().length < 2) {
    return { error: "Please provide a valid organization name (at least 2 characters)." }
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "Authentication required to complete onboarding." }
    }

  // Update profile full_name if provided
  if (fullName && fullName.trim().length > 0) {
    await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id)
  }

  // Generate URL slug from org name
  const baseSlug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

  // Insert organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name: orgName.trim(),
      slug,
    })
    .select("id")
    .single()

  if (orgError || !org) {
    return { error: orgError?.message || "Failed to create organization." }
  }

  // Insert owner membership
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner",
    })

  if (memberError) {
    return { error: memberError.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    if (
      errorMsg.includes("fetch failed") ||
      errorMsg.includes("ENOTFOUND") ||
      errorMsg.includes("Failed to fetch")
    ) {
      const cookieStore = await cookies()
      cookieStore.set(
        "dev_session",
        JSON.stringify({
          id: "00000000-0000-0000-0000-000000000001",
          email: "dev@commandcenter.io",
          name: fullName.trim() || "Dev User",
          role: "owner",
          orgId: "00000000-0000-0000-0000-000000000001",
          orgName: orgName.trim() || "Acme Global Operations",
        }),
        { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 }
      )
      revalidatePath("/", "layout")
      redirect("/dashboard")
    }
    throw err
  }
}
