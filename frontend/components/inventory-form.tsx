"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

const inventoryFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100),
  category: z.enum([
    "stationery",
    "tools",
    "parts",
    "consumables",
    "office_supplies",
    "cleaning_supplies",
    "safety_equipment",
    "other",
  ]),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or greater"),
  unit: z.enum([
    "piece",
    "box",
    "pack",
    "carton",
    "roll",
    "meter",
    "liter",
    "kilogram",
    "gram",
    "dozen",
    "ream",
    "set",
  ]),
  location: z.string().min(1, "Location is required").max(100),
  department: z.string().min(1, "Department is required").max(50),
  minimumQuantity: z.coerce.number().min(0, "Minimum quantity must be 0 or greater"),
  reorderPoint: z.coerce.number().min(0, "Reorder point must be 0 or greater"),
  supplier: z.string().max(100).optional(),
  cost: z.coerce.number().min(0, "Cost must be 0 or greater"),
  sku: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
})

type InventoryFormValues = z.infer<typeof inventoryFormSchema>

type InventoryFormProps = {
  itemId?: string
  onSuccess?: () => void
}

export function InventoryForm({ itemId, onSuccess }: InventoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "other",
      quantity: 0,
      unit: "piece",
      location: "",
      department: "",
      minimumQuantity: 0,
      reorderPoint: 0,
      supplier: "",
      cost: 0,
      sku: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (itemId) {
      setIsLoading(true)
      inventoryApi
        .getById(itemId)
        .then((response) => {
          const item = response.data
          form.reset({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            location: item.location,
            department: item.department,
            minimumQuantity: item.minimumQuantity,
            reorderPoint: item.reorderPoint,
            supplier: item.supplier || "",
            cost: Number(item.cost),
            sku: item.sku || "",
            notes: item.notes || "",
          })
        })
        .catch((error) => {
          console.error("Error loading item:", error)
          toast({
            title: "Error",
            description: "Failed to load item data. Please try again.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [itemId, form])

  const onSubmit = async (data: InventoryFormValues) => {
    setIsLoading(true)

    try {
      if (itemId) {
        await inventoryApi.update(itemId, data)
        toast({
          title: "Item Updated",
          description: "The inventory item has been updated successfully.",
        })
      } else {
        await inventoryApi.create(data)
        toast({
          title: "Item Created",
          description: "The inventory item has been created successfully.",
        })
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/inventory")
      }
    } catch (error) {
      console.error("Error saving item:", error)
      toast({
        title: "Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const categories = [
    { value: "stationery", label: "Stationery" },
    { value: "tools", label: "Tools" },
    { value: "parts", label: "Parts" },
    { value: "consumables", label: "Consumables" },
    { value: "office_supplies", label: "Office Supplies" },
    { value: "cleaning_supplies", label: "Cleaning Supplies" },
    { value: "safety_equipment", label: "Safety Equipment" },
    { value: "other", label: "Other" },
  ]

  const units = [
    { value: "piece", label: "Piece" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "carton", label: "Carton" },
    { value: "roll", label: "Roll" },
    { value: "meter", label: "Meter" },
    { value: "liter", label: "Liter" },
    { value: "kilogram", label: "Kilogram" },
    { value: "gram", label: "Gram" },
    { value: "dozen", label: "Dozen" },
    { value: "ream", label: "Ream" },
    { value: "set", label: "Set" },
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="A4 Paper" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
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
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU / Item Code</FormLabel>
                        <FormControl>
                          <Input placeholder="STN-A4-001" {...field} />
                        </FormControl>
                        <FormDescription>Optional unique identifier</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Units */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Quantity & Units</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Quantity*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit of Measurement*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minimumQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Quantity*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>Critical threshold for stock</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reorderPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Point*</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormDescription>When to order more</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Department */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Location & Department</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="Storage Room A - Shelf 3" {...field} />
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
                      <FormLabel>Department*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cost & Supplier */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Cost & Supplier</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Unit*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <Input placeholder="Office Supplies Co." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Additional Information</h3>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional information about this item"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {itemId ? "Update Item" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
