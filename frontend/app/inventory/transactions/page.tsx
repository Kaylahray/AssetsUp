"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, Package, ArrowLeft, ArrowRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { inventoryApi } from "@/lib/api"
import type { StockTransaction } from "@/types"

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<StockTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [summary, setSummary] = useState({
    totalIn: 0,
    totalOut: 0,
    totalAdjustments: 0,
    totalDamaged: 0,
    totalExpired: 0,
  })

  useEffect(() => {
    fetchTransactions()
    fetchSummary()
  }, [typeFilter, searchQuery])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter)
      if (searchQuery) params.append("search", searchQuery)

      const response = await inventoryApi.getAllTransactions(`?${params.toString()}`)
      setTransactions(response.data)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "Failed to load transactions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      // Get the date range for the last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const params = new URLSearchParams()
      params.append("startDate", startDate.toISOString())
      params.append("endDate", endDate.toISOString())

      const response = await inventoryApi.getTransactionSummary(`?${params.toString()}`)
      setSummary(response.data)
    } catch (error) {
      console.error("Error fetching summary:", error)
    }
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

  const transactionTypes = [
    { value: "stock_in", label: "Stock In" },
    { value: "stock_out", label: "Stock Out" },
    { value: "adjustment", label: "Adjustment" },
    { value: "return", label: "Return" },
    { value: "damage", label: "Damage" },
    { value: "expired", label: "Expired" },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Transactions</h1>
          <p className="text-muted-foreground mt-1">Track and manage inventory movements</p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link href="/inventory">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Inventory
            </Link>
          </Button>
          <Button asChild>
            <Link href="/inventory/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Record Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock In</CardTitle>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalIn}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Out</CardTitle>
            <ArrowLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOut}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Adjustments</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAdjustments}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Damaged</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDamaged}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalExpired}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="text-sm font-medium mb-1 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by item name, reference number, or requested by..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium mb-1 block">
                Transaction Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {transactionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No transactions found.{" "}
                    <Link href="/inventory/transactions/new" className="text-primary hover:underline">
                      Record your first transaction
                    </Link>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/inventory/${transaction.inventoryItemId}`} className="font-medium hover:underline">
                        {transaction.inventoryItem?.name || "Unknown Item"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type.replace("_", " ").charAt(0).toUpperCase() +
                          transaction.type.replace("_", " ").slice(1)}
                      </Badge>
                    </TableCell>
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
                      <div className="text-xs text-muted-foreground">
                        {transaction.quantityBefore} → {transaction.quantityAfter}
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.referenceNumber || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{transaction.requestedBy || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>{transaction.department || <span className="text-muted-foreground">-</span>}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
