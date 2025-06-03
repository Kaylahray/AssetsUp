"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Search, Filter, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { branchApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export default function BranchAssetsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [branch, setBranch] = useState<any>(null)
  const [assets, setAssets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [branchLoading, setBranchLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetchBranch()
    fetchAssets()
  }, [params.id])

  const fetchBranch = async () => {
    setBranchLoading(true)
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
      setBranchLoading(false)
    }
  }

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const response = await branchApi.getBranchAssets(params.id)
      setAssets(response.data)

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(response.data.map((asset: any) => asset.category)))
      setCategories(uniqueCategories as string[])
    } catch (error) {
      console.error("Failed to fetch assets:", error)
      toast({
        title: "Error",
        description: "Failed to load branch assets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assetTag && asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = categoryFilter ? asset.category === categoryFilter : true
    const matchesStatus = statusFilter ? asset.status === statusFilter : true

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {branchLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <div>
            <h1 className="text-2xl font-bold">{branch?.name} - Assets</h1>
            <p className="text-muted-foreground">Manage assets at this branch</p>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("")
              setStatusFilter("")
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        <Button asChild>
          <Link href={`/assets/new?branchId=${params.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No assets found for this branch</p>
            <Button asChild>
              <Link href={`/assets/new?branchId=${params.id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <Badge
                    variant={
                      asset.status === "available"
                        ? "default"
                        : asset.status === "assigned"
                          ? "secondary"
                          : asset.status === "maintenance"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {asset.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset Tag:</span>
                    <span>{asset.assetTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <span>{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{asset.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span>{asset.department}</span>
                  </div>
                  {asset.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned To:</span>
                      <span>{asset.assignedTo.name}</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/assets/${asset.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
