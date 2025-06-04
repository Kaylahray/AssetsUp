import type { Metadata } from "next"
import CertificateDetail from "@/components/certificates/certificate-detail"

interface CertificateDetailPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Certificate Details | Asset Management System",
  description: "View detailed information about an asset certificate",
}

export default function CertificateDetailPage({ params }: CertificateDetailPageProps) {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Certificate Details</h1>
      <CertificateDetail certificateId={params.id} />
    </div>
  )
}
