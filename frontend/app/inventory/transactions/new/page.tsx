import type { Metadata } from "next"
import { TransactionForm } from "@/components/inventory/transaction-form"

export const metadata: Metadata = {
  title: "Record Transaction - ManageAssets",
  description: "Record a new inventory transaction",
}

export default function NewTransactionPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Record Transaction</h1>
        <p className="text-muted-foreground mt-1">Record stock movement for inventory items</p>
      </div>

      <TransactionForm />
    </div>
  )
}
