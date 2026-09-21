"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Bell, Sparkles, Command } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MobileNav } from "@/components/layouts/mobile-nav"

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xs sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block">
            Workspace
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">/</span>
          <span className="text-xs font-semibold text-foreground">
            Acme Global Operations
          </span>
          <Badge variant="outline" className="text-[10px] hidden md:inline-flex bg-muted/50 font-normal">
            Phase 0 Preview
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Trigger Mock */}
        <button
          type="button"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted/60 transition-colors w-44 md:w-60 justify-between focus:outline-hidden"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5" />
            <span className="truncate">Search leads, deals, tasks...</span>
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>

        {/* AI Quick Chat Action */}
        <Link
          href="/ai"
          className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs h-8" })}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">AI Command</span>
        </Link>

        {/* Notifications Icon with indicator */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User avatar small */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          I
        </div>
      </div>
    </header>
  )
}
