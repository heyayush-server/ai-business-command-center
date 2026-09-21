import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-1">
          <Badge variant="outline" className="text-[10px] font-mono">
            PHASE 0 UI PREVIEW
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Sign in to your account</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your credentials to access your organization workspace
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Work Email</Label>
          <Input id="email" type="email" placeholder="name@company.com" disabled />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-xs text-muted-foreground">Forgot password?</span>
          </div>
          <Input id="password" type="password" placeholder="••••••••" disabled />
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
            Sign in with Google OAuth (Phase 1)
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground border-t pt-4">
        <span>Don&apos;t have an account yet? </span>
        <Link href="/register" className="font-semibold text-primary hover:underline ml-1">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  )
}
