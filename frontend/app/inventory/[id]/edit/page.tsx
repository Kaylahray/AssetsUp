import type { Metadata } from "next"
import { InventoryForm } from "@/components/inventory/inventory-form"

export const metadata: Metadata = {
  title: "Edit Inventory Item - ManageAssets",
  description: "Edit inventory item details",
}

export default function EditInventoryItemPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Inventory Item</h1>
        <p className="text-muted-foreground mt-1">Update inventory item details</p>
      </div>

      <InventoryForm itemId={params.id} />
    </div>
  )
}
