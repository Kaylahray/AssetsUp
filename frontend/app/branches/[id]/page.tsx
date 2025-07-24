"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Boxes,
  BarChart3,
  Clock,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { branchApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export default function BranchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [branch, setBranch] = useState<any>(null)
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchBranch()
    fetchStatistics()
  }, [params.id])

  const fetchBranch = async () => {
    setLoading(true)
    try {
      const response = await branchApi.getById(params.id)
      setBranch(response.data)
    } catch (error) {
      console.error("Failed to fetch branch:", error)
      toast({
        title: "Error",
        description: "Failed to load branch details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setStatsLoading(true)
    try {
      const response = await branchApi.getBranchStatistics(params.id)
      setStatistics(response.data)
    } catch (error) {
      console.error("Failed to fetch branch statistics:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await branchApi.delete(params.id)
        toast({
          title: "Success",
          description: "Branch deleted successfully",
        })
        router.push("/branches")
      } catch (error) {
        console.error("Failed to delete branch:", error)
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete branch",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>

        <Skeleton className="h-[400px] mb-6" />
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Branch Not Found</h1>
        </div>
        <p>The requested branch could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{branch.name}</h1>
            <p className="text-muted-foreground">Code: {branch.code}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/branches/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branch Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p>{branch.address}</p>
                  <p>
                    {branch.city}, {branch.state} {branch.postalCode}
                  </p>
                  <p>{branch.country}</p>
                </div>
              </div>
              {branch.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{branch.phone}</span>
                </div>
              )}
              {branch.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{branch.email}</span>
                </div>
              )}
              <div className="pt-2">
                <Badge variant={branch.isActive ? "default" : "secondary"}>
                  {branch.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Branch Manager</CardTitle>
          </CardHeader>
          <CardContent>
            {branch.manager ? (
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{branch.manager.name}</p>
                  <p className="text-sm text-muted-foreground">{branch.manager.email}</p>
                  <p className="text-sm text-muted-foreground capitalize">{branch.manager.role.replace("_", " ")}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-20 text-muted-foreground">
                <p>No manager assigned</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Regional Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Timezone: {branch.timezone || "Default"}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Currency: {branch.currency || "Default"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Branch Statistics</CardTitle>
          <CardDescription>Overview of assets, inventory, and users at this branch</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-muted-foreground text-sm">Total Assets</div>
                <div className="text-2xl font-bold mt-1">{statistics.assetsCount}</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-muted-foreground text-sm">Asset Utilization</div>
                <div className="text-2xl font-bold mt-1">{Math.round(statistics.assetUtilizationRate)}%</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-muted-foreground text-sm">Inventory Items</div>
                <div className="text-2xl font-bold mt-1">{statistics.inventoryItemsCount}</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-muted-foreground text-sm">Users</div>
                <div className="text-2xl font-bold mt-1">{statistics.usersCount}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="py-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Branch Assets</CardTitle>
                  <CardDescription>Assets assigned to this branch</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/branches/${params.id}/assets`}>
                    <Package className="mr-2 h-4 w-4" />
                    View All Assets
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p>View detailed asset information for this branch</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="py-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Branch Inventory</CardTitle>
                  <CardDescription>Inventory items at this branch</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/branches/${params.id}/inventory`}>
                    <Boxes className="mr-2 h-4 w-4" />
                    View All Inventory
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p>View detailed inventory information for this branch</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="py-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Branch Users</CardTitle>
                  <CardDescription>Users assigned to this branch</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/branches/${params.id}/users`}>
                    <User className="mr-2 h-4 w-4" />
                    View All Users
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p>View detailed user information for this branch</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="py-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Branch Reports</CardTitle>
                  <CardDescription>Analytics and reports for this branch</CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/reports?branchId=${params.id}`}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p>View detailed reports and analytics for this branch</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
