import type { Metadata } from "next"
import CertificateVerification from "@/components/certificates/certificate-verification"

export const metadata: Metadata = {
  title: "Verify Certificate | Asset Management System",
  description: "Verify the authenticity of an asset certificate",
}

export default function VerifyPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Certificate Verification</h1>
      <CertificateVerification />
    </div>
  )
}
