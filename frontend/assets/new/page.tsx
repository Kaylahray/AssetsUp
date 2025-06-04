"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckoutForm } from "@/components/assets/checkout-form"
import { assetApi } from "@/lib/api"
import type { Asset } from "@/types"

interface NewCheckoutPageProps {
  searchParams: { assetId?: string }
}

export default function NewCheckoutPage({ searchParams }: NewCheckoutPageProps) {
  const router = useRouter()
  const { assetId } = searchParams
  const [asset, setAsset] = useState<Asset | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (assetId) {
      setIsLoading(true)
      assetApi
        .getById(assetId)
        .then((response) => {
          setAsset(response.data)
        })
        .catch((error) => {
          console.error("Error loading asset:", error)
          setError("Failed to load asset. Please try again.")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setError("No asset selected. Please select an asset to check out.")
    }
  }, [assetId])

  const handleSuccess = () => {
    router.push("/assets/checkouts")
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assets/checkouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checkouts
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check Out Asset</CardTitle>
          <CardDescription>Fill out the form to check out an asset for temporary use</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button asChild>
                <Link href="/assets">Select an Asset</Link>
              </Button>
            </div>
          ) : asset ? (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-medium mb-2">Selected Asset</h3>
                <p className="text-lg font-semibold">{asset.name}</p>
                <p className="text-sm text-muted-foreground">
                  {asset.assetTag} • {asset.category}
                </p>
              </div>

              <CheckoutForm asset={asset} onSuccess={handleSuccess} />
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
