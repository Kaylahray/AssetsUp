import type { Metadata } from "next"
import { AssetForm } from "@/components/assets/asset-form"

export const metadata: Metadata = {
  title: "Register New Asset - ManageAssets",
  description: "Register a new asset in the system",
}

export default function NewAssetPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Register New Asset</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to register a new asset in the system</p>
      </div>

      <AssetForm />
    </div>
  )
}
