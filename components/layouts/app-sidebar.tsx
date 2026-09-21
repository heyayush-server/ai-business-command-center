"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  CheckSquare,
  Activity,
  Bot,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronsUpDown,
  Building,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Leads",
    href: "/leads",
    icon: Users,
    badge: "142",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Building2,
    badge: null,
  },
  {
    title: "Deals",
    href: "/deals",
    icon: TrendingUp,
    badge: "$342k",
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    badge: "6 due",
  },
  {
    title: "Activities",
    href: "/activities",
    icon: Activity,
    badge: null,
  },
  {
    title: "AI Assistant",
    href: "/ai",
    icon: Bot,
    badge: "AI 7.0",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
]

interface AppSidebarProps {
  className?: string
  onNavigate?: () => void
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const pathname = usePathname()
  const [activeOrg, setActiveOrg] = React.useState("Acme Global Corp")

  return (
    <aside
      className={cn(
        "flex h-full flex-col justify-between border-r border-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Top Header & Org Switcher */}
      <div className="space-y-4 p-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-sidebar-foreground leading-tight">
              Command Center
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Autonomous Suite
            </span>
          </div>
        </div>

        {/* Organization Selector Placeholder */}
        <div className="pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-3 py-2 text-left text-xs font-medium hover:bg-sidebar-accent transition-colors focus:outline-hidden focus:ring-1 focus:ring-sidebar-ring cursor-pointer">
              <div className="flex items-center gap-2 truncate">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
                  <Building className="h-3 w-3" />
                </div>
                <span className="truncate font-semibold text-sidebar-foreground">{activeOrg}</span>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground uppercase">
                Workspaces (Multi-Tenant)
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setActiveOrg("Acme Global Corp")}
                className="flex items-center justify-between text-xs"
              >
                <span>Acme Global Corp</span>
                {activeOrg === "Acme Global Corp" && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveOrg("Northwind Ventures")}
                className="flex items-center justify-between text-xs"
              >
                <span>Northwind Ventures</span>
                {activeOrg === "Northwind Ventures" && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                + Create New Organization (Phase 1)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4 font-normal",
                      isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Area: AI Engine Status & User Profile */}
      <div className="space-y-3 p-4 border-t border-sidebar-border">
        {/* AI Engine Status indicator */}
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-sidebar-foreground">AI Tool Engine</span>
            </div>
            <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
              Mock Mode
            </Badge>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Zero-cost local execution active. Ready for live Anthropic / OpenAI.
          </p>
        </div>

        {/* User Profile Placeholder */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-sidebar-accent transition-colors focus:outline-hidden cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                I
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-sidebar-foreground">Ishan</span>
                <span className="text-[10px] text-muted-foreground">Owner • Workspace Admin</span>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs font-medium">My Account</DropdownMenuLabel>
            <DropdownMenuItem className="text-xs">
              <Link href="/settings" className="w-full">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs">
              <Link href="/settings" className="w-full">API &amp; AI Keys</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-destructive">
              <Link href="/" className="w-full">Sign Out (Demo)</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
