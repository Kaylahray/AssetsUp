import { BranchForm } from "@/components/branches/branch-form"

export default function EditBranchPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Branch</h1>
      <BranchForm branchId={params.id} />
    </div>
  )
}
