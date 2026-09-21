import React from "react"
import { Users, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MOCK_LEAD_CONVERSION } from "@/lib/mock/dashboard-data"

export function LeadConversionChart() {
  return (
    <Card className="border-border bg-card shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold text-foreground">
            Lead Ingestion &amp; Conversion
          </CardTitle>
          <CardDescription className="text-xs">
            Performance and conversion efficiency across acquisition channels.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Users className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        {MOCK_LEAD_CONVERSION.map((item) => (
          <div key={item.source} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{item.source}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-[11px]">
                  {item.converted} / {item.leads} leads
                </span>
                <span className="font-semibold text-foreground">{item.rate}</span>
              </div>
            </div>
            {/* Progress indicator */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full bg-primary/80 rounded-full transition-all"
                style={{ width: item.rate }}
              />
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Overall conversion rate: 33.8%</span>
          <a href="/leads" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Manage Leads <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
