import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RegisterPage() {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-1">
          <Badge variant="outline" className="text-[10px] font-mono">
            PHASE 0 UI PREVIEW
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Create your account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Deploy an isolated workspace with PostgreSQL Row-Level Security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="Ishan Sharma" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" placeholder="ishan@company.com" disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orgName">Organization Name</Label>
          <Input id="orgName" placeholder="Acme Global Operations" disabled />
        </div>

        <div className="pt-2 space-y-3">
          <Link
            href="/dashboard"
            className={buttonVariants({ className: "w-full gap-2" })}
          >
            <span>Demo Direct Access (Launch Dashboard)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Button variant="outline" disabled className="w-full text-xs">
            Sign up with Google OAuth (Phase 1)
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground border-t pt-4">
        <span>Already have an account? </span>
        <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
