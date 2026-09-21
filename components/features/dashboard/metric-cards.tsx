import React from "react"
import {
  DollarSign,
  UserPlus,
  Building2,
  CheckSquare,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MOCK_METRICS } from "@/lib/mock/dashboard-data"

const ICONS: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-4 w-4 text-primary" />,
  UserPlus: <UserPlus className="h-4 w-4 text-blue-600" />,
  Building2: <Building2 className="h-4 w-4 text-emerald-600" />,
  CheckSquare: <CheckSquare className="h-4 w-4 text-amber-600" />,
  TrendingUp: <TrendingUp className="h-4 w-4 text-indigo-600" />,
}

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {MOCK_METRICS.map((metric) => {
        const icon = ICONS[metric.iconName] ?? <DollarSign className="h-4 w-4 text-primary" />

        return (
          <Card key={metric.label} className="border-border bg-card shadow-2xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60">
                  {icon}
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{metric.value}</span>
                <span
                  className={`text-xs font-medium ${
                    metric.trend === "up"
                      ? "text-emerald-600"
                      : metric.trend === "down"
                      ? "text-rose-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground truncate">{metric.subtext}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
