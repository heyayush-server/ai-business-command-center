"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/80 bg-background/95 backdrop-blur-md shadow-xs"
          : "border-b border-transparent bg-background/60 backdrop-blur-xs"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">
              Command Center
            </span>
            <span className="text-[10px] font-medium tracking-wide uppercase text-muted-foreground">
              One Intelligent Workspace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-muted-foreground">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#product" className="hover:text-foreground transition-colors">
            Product
          </a>
          <a href="#ai-assistant" className="hover:text-foreground transition-colors">
            AI Assistant
          </a>
          <a href="#insights" className="hover:text-foreground transition-colors">
            Insights
          </a>
          <a href="#interactive-demo" className="hover:text-foreground transition-colors">
            Live Demo
          </a>
        </nav>

        {/* Right CTA Area */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-xs font-medium hidden sm:inline-flex",
            })}
          >
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className={buttonVariants({
              size: "sm",
              className: "gap-1.5 shadow-xs font-medium text-xs h-8 px-3.5",
            })}
          >
            <span>Try the Command Center</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-border/80 bg-background/98 px-4 pt-3 pb-5 space-y-3 lg:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-muted-foreground">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              How It Works
            </a>
            <a
              href="#product"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              Product
            </a>
            <a
              href="#ai-assistant"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              AI Assistant
            </a>
            <a
              href="#insights"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              Proactive Insights
            </a>
            <a
              href="#interactive-demo"
              onClick={() => setMobileOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-muted hover:text-foreground transition-colors"
            >
              Live Demo
            </a>
          </nav>
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "sm", className: "w-full text-xs" })}
            >
              Sign In to Workspace
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
