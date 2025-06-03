"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { Loader2 } from "lucide-react"

import { CheckoutDetail } from "@/components/assets/checkout-detail"
import { checkoutApi } from "@/lib/api"
import type { AssetCheckout } from "@/types"

interface CheckoutDetailPageProps {
  params: {
    id: string
  }
}

export default function CheckoutDetailPage({ params }: CheckoutDetailPageProps) {
  const { id } = params
  const [checkout, setCheckout] = useState<AssetCheckout | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      notFound()
    }

    setIsLoading(true)
    checkoutApi
      .getById(id)
      .then((response) => {
        setCheckout(response.data)
      })
      .catch((error) => {
        console.error("Error loading checkout:", error)
        setError("Failed to load checkout details")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !checkout) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted-foreground">{error || "Checkout not found"}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <CheckoutDetail checkout={checkout} />
    </div>
  )
}
