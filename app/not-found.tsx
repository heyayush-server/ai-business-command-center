import Link from "next/link"
import { Compass, ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-6">
        <Compass className="h-8 w-8 text-primary" />
      </div>
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground mb-3">
        404 ERROR
      </span>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
        The page you are looking for does not exist, has been moved, or is part of a module currently slated for future development phases.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "default", className: "gap-2" })}
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline" })}
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
