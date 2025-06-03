"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <div className="rounded-full bg-red-100 p-4 mb-4">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong!</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        An unexpected error has occurred. We've been notified and are working to fix the issue.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
