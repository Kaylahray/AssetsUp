import { BranchForm } from "@/components/branches/branch-form"

export default function NewBranchPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Branch</h1>
      <BranchForm />
    </div>
  )
}
