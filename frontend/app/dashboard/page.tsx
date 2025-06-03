"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { authApi } from "@/lib/api"
import type { User } from "@/types"
import AssetSummary from "@/components/dashboard/asset-summary"
import InventorySummary from "@/components/dashboard/inventory-summary"
import MaintenanceSummary from "@/components/dashboard/maintenance-summary"
import RecentActivity from "@/components/dashboard/recent-activity"
import AssignmentStats from "@/components/dashboard/assignment-stats"
import CheckoutDashboard from "@/components/dashboard/checkout-dashboard"
import AuditStatistics from "@/components/dashboard/audit-statistics"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const response = await authApi.getProfile()
      setUser(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name}</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AssetSummary />
            <InventorySummary />
            <MaintenanceSummary />
            <RecentActivity />
            <AssignmentStats />
            <CheckoutDashboard />
          </div>
        </TabsContent>

        <TabsContent value="assets">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AssetSummary />
            <AssignmentStats />
            <CheckoutDashboard />
            <RecentActivity />
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <InventorySummary />
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Inventory Levels</CardTitle>
                <CardDescription>Current inventory levels across all categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full bg-gray-100"></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <MaintenanceSummary />
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>Upcoming and overdue maintenance tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full bg-gray-100"></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AuditStatistics />
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Blockchain Verification Status</CardTitle>
                <CardDescription>Status of on-chain records and verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full bg-gray-100"></div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
