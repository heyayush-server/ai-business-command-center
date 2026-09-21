import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AI Business Command Center | Unified Business Intelligence & Operations",
  description:
    "Turn business data into decisions and actions. Unified CRM, pipeline tracking, task orchestration, and auditable AI execution.",
  keywords: [
    "AI Business Operations",
    "CRM",
    "Lead Management",
    "SaaS Dashboard",
    "Next.js 16",
    "AI Agent Tools",
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/10 selection:text-primary">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
