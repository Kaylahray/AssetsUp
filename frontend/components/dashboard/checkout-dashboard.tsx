"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, AlertTriangle, CheckCircle, Plus, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckoutList } from "@/components/assets/checkout-list"
import { checkoutApi } from "@/lib/api"
import type { AssetCheckout } from "@/types"

export function CheckoutDashboard() {
  const [activeCheckouts, setActiveCheckouts] = useState<AssetCheckout[]>([])
  const [overdueCheckouts, setOverdueCheckouts] = useState<AssetCheckout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadCheckouts = async () => {
    setIsLoading(true)
    try {
      const [activeRes, overdueRes] = await Promise.all([
        checkoutApi.getActiveCheckouts(),
        checkoutApi.getAll({ overdue: true }),
      ])

      setActiveCheckouts(activeRes.data)
      setOverdueCheckouts(overdueRes.data)
    } catch (error) {
      console.error("Error loading checkouts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCheckouts()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Asset Checkouts</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/assets/checkouts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Checkout
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/assets/checkouts/qr">
              <QrCode className="mr-2 h-4 w-4" />
              QR Checkout
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Checkouts</CardTitle>
            <CardDescription>Currently checked out assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : activeCheckouts.length}
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Active
            </Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Assets</CardTitle>
            <CardDescription>Assets past their due date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : overdueCheckouts.length}
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
            <CardDescription>Assets returned on time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${
                  overdueCheckouts.length > 0
                    ? Math.round(((activeCheckouts.length - overdueCheckouts.length) / activeCheckouts.length) * 100)
                    : 100
                }%`
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              On Time
            </Badge>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Checkouts</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <CheckoutList checkouts={activeCheckouts} onReturn={loadCheckouts} />
          )}
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <CheckoutList checkouts={overdueCheckouts} onReturn={loadCheckouts} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
