"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { inventoryApi } from "@/lib/api"
import { Loader2 } from "lucide-react"
import type { InventoryItem } from "@/types"

const transactionFormSchema = z.object({
  inventoryItemId: z.string().min(1, "Inventory item is required"),
  type: z.enum(["stock_in", "stock_out", "adjustment", "return", "damage", "expired"]),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  referenceNumber: z.string().optional(),
  reason: z.string().optional(),
  requestedBy: z.string().optional(),
  department: z.string().optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

export function TransactionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      inventoryItemId: searchParams.get("itemId") || "",
      type: "stock_in",
      quantity: 1,
      referenceNumber: "",
      reason: "",
      requestedBy: "",
      department: "",
    },
  })

  // Load inventory items
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await inventoryApi.getAll()
        setInventoryItems(response.data)

        // If itemId is provided in URL, load that item's details
        const itemId = searchParams.get("itemId")
        if (itemId) {
          const item = response.data.find((item: InventoryItem) => item.id === itemId)
          if (item) {
            setSelectedItem(item)
          }
        }
      } catch (error) {
        console.error("Error fetching inventory items:", error)
        toast({
          title: "Error",
          description: "Failed to load inventory items. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchInventoryItems()
  }, [searchParams])

  // Update selected item when inventory item changes
  const handleItemChange = (itemId: string) => {
    const item = inventoryItems.find((item) => item.id === itemId)
    setSelectedItem(item || null)
  }

  // Handle form submission
  const onSubmit = async (data: TransactionFormValues) => {
    setIsLoading(true)

    try {
      await inventoryApi.createTransaction(data)
      toast({
        title: "Transaction Recorded",
        description: "The inventory transaction has been recorded successfully.",
      })

      // Redirect to inventory item page or transactions page
      if (data.inventoryItemId) {
        router.push(`/inventory/${data.inventoryItemId}`)
      } else {
        router.push("/inventory/transactions")
      }
    } catch (error) {
      console.error("Error recording transaction:", error)
      toast({
        title: "Error",
        description: "Failed to record transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const departments = [
    "Administration",
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "HR",
    "Operations",
    "IT",
    "Customer Support",
    "Research",
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Transaction Details</h3>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="inventoryItemId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inventory Item*</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        handleItemChange(value)
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inventory item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedItem && (
                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Selected Item Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Quantity:</span>{" "}
                      <span className="font-medium">
                        {selectedItem.quantity} {selectedItem.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      <span className="font-medium">{selectedItem.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>{" "}
                      <span className="font-medium">{selectedItem.department}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit Cost:</span>{" "}
                      <span className="font-medium">${Number(selectedItem.cost).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {transactionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity*</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      {form.watch("type") === "stock_out" && selectedItem && (
                        <FormDescription>
                          Available: {selectedItem.quantity} {selectedItem.unit}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="PO-2023-001" {...field} />
                    </FormControl>
                    <FormDescription>Optional reference number (e.g., purchase order, invoice, etc.)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="requestedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested By</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason / Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Reason for this transaction" className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Record Transaction
          </Button>
        </div>
      </form>
    </Form>
  )
}
