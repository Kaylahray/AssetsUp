"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { api } from "@/lib/api"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        // Call logout endpoint
        await api.post("/auth/logout")
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        // Remove token from localStorage
        localStorage.removeItem("token")

        // Redirect to login page
        router.push("/login")
      }
    }

    logout()
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Logging out...</p>
    </div>
  )
}
