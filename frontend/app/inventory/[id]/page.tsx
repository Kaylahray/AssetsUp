"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit, Trash2, Package, AlertTriangle, BarChart3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { inventoryApi } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import type { InventoryItem, StockTransaction } from "@/types"

export default function InventoryItemDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Load inventory item details
  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        const response = await inventoryApi.getById(params.id)
        setItem(response.data)
      } catch (error) {
        console.error("Error fetching inventory item:", error)
        toast({
          title: "Error",
          description: "Failed to load inventory item details. Please try again.",
          variant: "destructive",
        })
        router.push("/inventory")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [params.id, router])

  // Load transaction history
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!params.id) return

      setIsTransactionsLoading(true)
      try {
        const response = await inventoryApi.getTransactions(params.id)
        setTransactions(response.data)
      } catch (error) {
        console.error("Error fetching transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction history. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsTransactionsLoading(false)
      }
    }

    fetchTransactions()
  }, [params.id])

  // Handle item deletion
  const handleDeleteItem = async () => {
    try {
      await inventoryApi.delete(params.id)
      toast({
        title: "Item Deleted",
        description: "The inventory item has been deleted successfully.",
      })
      router.push("/inventory")
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  // Get stock status
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

  // Get transaction type badge color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "stock_in":
        return "bg-green-100 text-green-800"
      case "stock_out":
        return "bg-blue-100 text-blue-800"
      case "adjustment":
        return "bg-purple-100 text-purple-800"
      case "return":
        return "bg-cyan-100 text-cyan-800"
      case "damage":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading inventory item details...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p>Inventory item not found</p>
        </div>
      </div>
    )
  }

  const status = getStockStatus(item)
  const totalValue = item.quantity * Number(item.cost)

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/inventory")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground mt-1">
              {item.sku ? `SKU: ${item.sku}` : `${item.category.replace("_", " ")}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href={`/inventory/transactions/new?itemId=${item.id}`}>
              <Package className="mr-2 h-4 w-4" />
              Record Transaction
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/inventory/${item.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {item.quantity} {item.unit}
            </div>
            <p className="text-xs text-muted-foreground">
              Min: {item.minimumQuantity} | Reorder: {item.reorderPoint}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unit Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(item.cost))}</div>
            <p className="text-xs text-muted-foreground">Per {item.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {item.quantity} {item.unit} × {formatCurrency(Number(item.cost))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Item Details Tabs */}
      <Tabs defaultValue="details" className="mb-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Item Name</dt>
                    <dd className="text-base">{item.name}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                    <dd className="text-base">
                      {item.category.replace("_", " ").charAt(0).toUpperCase() +
                        item.category.slice(1).replace("_", " ")}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">SKU / Item Code</dt>
                    <dd className="text-base">
                      {item.sku || <span className="text-muted-foreground">Not specified</span>}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Quantity & Units */}
            <Card>
              <CardHeader>
                <CardTitle>Quantity & Units</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Current Quantity</dt>
                    <dd className="text-base">
                      {item.quantity} {item.unit}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Minimum Quantity</dt>
                    <dd className="text-base">
                      {item.minimumQuantity} {item.unit}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Reorder Point</dt>
                    <dd className="text-base">
                      {item.reorderPoint} {item.unit}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Location & Department */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Department</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Storage Location</dt>
                    <dd className="text-base">{item.location}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                    <dd className="text-base">{item.department}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Cost & Supplier */}
            <Card>
              <CardHeader>
                <CardTitle>Cost & Supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Cost per Unit</dt>
                    <dd className="text-base">{formatCurrency(Number(item.cost))}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Supplier</dt>
                    <dd className="text-base">
                      {item.supplier || <span className="text-muted-foreground">Not specified</span>}
                    </dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Total Value</dt>
                    <dd className="text-base">{formatCurrency(totalValue)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd className="text-base">
                      {item.notes || <span className="text-muted-foreground">No additional notes</span>}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              <Button asChild size="sm">
                <Link href={`/inventory/transactions/new?itemId=${item.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Transaction
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No transaction history found</p>
                  <Button asChild>
                    <Link href={`/inventory/transactions/new?itemId=${item.id}`}>Record First Transaction</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity Before</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Quantity After</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Performed By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTransactionTypeColor(transaction.type)}>
                            {transaction.type.replace("_", " ").charAt(0).toUpperCase() +
                              transaction.type.replace("_", " ").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.quantityBefore}</TableCell>
                        <TableCell>
                          {transaction.type === "stock_in" || transaction.type === "return" ? (
                            <span className="text-green-600">+{transaction.quantity}</span>
                          ) : transaction.type === "stock_out" ||
                            transaction.type === "damage" ||
                            transaction.type === "expired" ? (
                            <span className="text-red-600">-{transaction.quantity}</span>
                          ) : (
                            <span className="text-purple-600">→ {transaction.quantity}</span>
                          )}
                        </TableCell>
                        <TableCell>{transaction.quantityAfter}</TableCell>
                        <TableCell>
                          {transaction.referenceNumber || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {transaction.performedBy?.name || transaction.requestedBy || (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the inventory item "{item.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
