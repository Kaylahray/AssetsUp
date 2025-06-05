import type { Metadata } from "next"
import { AssetForm } from "@/components/assets/asset-form"

export const metadata: Metadata = {
  title: "Edit Asset - ManageAssets",
  description: "Edit asset details",
}

export default function EditAssetPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Asset</h1>
        <p className="text-muted-foreground mt-1">Update the asset information</p>
      </div>

      <AssetForm assetId={params.id} />
    </div>
  )
}
