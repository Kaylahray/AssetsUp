import type { Metadata } from "next"
import { InventoryForm } from "@/components/inventory/inventory-form"

export const metadata: Metadata = {
  title: "Add Inventory Item - ManageAssets",
  description: "Add a new inventory item",
}

export default function NewInventoryItemPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add Inventory Item</h1>
        <p className="text-muted-foreground mt-1">Add a new item to your inventory</p>
      </div>

      <InventoryForm />
    </div>
  )
}
