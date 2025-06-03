"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  MoreHorizontal,
  Edit,
  Trash2,
  History,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { inventoryApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { InventoryItem } from "@/types"

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [summary, setSummary] = useState({
    totalValue: 0,
    itemCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  })

  useEffect(() => {
    fetchInventory()
    fetchSummary()
  }, [categoryFilter, departmentFilter, searchQuery, lowStockOnly])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter)
      if (departmentFilter && departmentFilter !== "all") params.append("department", departmentFilter)
      if (searchQuery) params.append("search", searchQuery)
      if (lowStockOnly) params.append("lowStock", "true")

      const response = await inventoryApi.getAll(`?${params.toString()}`)
      setItems(response.data)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Failed to load inventory items. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await inventoryApi.getSummary()
      setSummary(response.data)
    } catch (error) {
      console.error("Error fetching summary:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      await inventoryApi.delete(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Item Deleted",
        description: "The inventory item has been deleted successfully.",
      })
      fetchSummary()
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    } else if (item.quantity <= item.minimumQuantity) {
      return { label: "Critical", color: "bg-orange-100 text-orange-800" }
    } else if (item.quantity <= item.reorderPoint) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const categories = [
    "stationery",
    "tools",
    "parts",
    "consumables",
    "office_supplies",
    "cleaning_supplies",
    "safety_equipment",
    "other",
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage consumables, tools, and supplies</p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href="/inventory/transactions">
              <History className="mr-2 h-4 w-4" />
              Transaction History
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
            <p className="text-xs text-muted-foreground">{summary.itemCount} items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Items below reorder point</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Items need immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Movement</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/inventory/transactions/new">
                <Package className="mr-2 h-4 w-4" />
                Record Transaction
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="text-sm font-medium mb-1 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search items..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-medium mb-1 block">
                Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace("_", " ").charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="department" className="text-sm font-medium mb-1 block">
                Department
              </label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={lowStockOnly ? "default" : "outline"}
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className="w-full"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No inventory items found.{" "}
                    <Link href="/inventory/new" className="text-primary hover:underline">
                      Add your first item
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const status = getStockStatus(item)
                  const totalValue = item.quantity * Number(item.cost)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.sku || "-"}</TableCell>
                      <TableCell>
                        {item.category.replace("_", " ").charAt(0).toUpperCase() +
                          item.category.slice(1).replace("_", " ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                          {item.quantity <= item.reorderPoint && (
                            <span className="text-xs text-muted-foreground">
                              Reorder: {item.reorderPoint} | Min: {item.minimumQuantity}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(item.cost))}</TableCell>
                      <TableCell>{formatCurrency(totalValue)}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/inventory/${item.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/inventory/${item.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/transactions/new?itemId=${item.id}`)}
                            >
                              <Package className="mr-2 h-4 w-4" />
                              Record Transaction
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
