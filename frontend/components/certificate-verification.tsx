"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { certificateApi } from "@/lib/api"
import { CheckCircle, XCircle, Search, Shield } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function CertificateVerification() {
  const [certificateNumber, setCertificateNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean
    certificate?: any
    message: string
  } | null>(null)

  const handleVerify = async () => {
    if (!certificateNumber) {
      toast({
        title: "Error",
        description: "Please enter a certificate number.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // First, try to find the certificate by number
      const certificateResponse = await certificateApi.getByNumber(certificateNumber)
      const certificate = certificateResponse.data

      if (!certificate) {
        setVerificationResult({
          valid: false,
          message: "Certificate not found. Please check the certificate number and try again.",
        })
        return
      }

      // Then verify it
      const verificationResponse = await certificateApi.verifyCertificate(certificate.id)
      const { valid, blockchainVerified } = verificationResponse.data

      setVerificationResult({
        valid,
        certificate,
        message: valid
          ? `Certificate #${certificateNumber} is valid${blockchainVerified ? " and verified on the blockchain" : ""}.`
          : `Certificate #${certificateNumber} is invalid or has been revoked.`,
      })
    } catch (error) {
      console.error("Failed to verify certificate:", error)
      setVerificationResult({
        valid: false,
        message: "Failed to verify certificate. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Certificate</CardTitle>
        <CardDescription>Enter a certificate number to verify its authenticity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input
                id="certificateNumber"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Enter certificate number"
                disabled={loading}
              />
            </div>
            <Button onClick={handleVerify} disabled={loading || !certificateNumber}>
              {loading ? "Verifying..." : "Verify"}
              <Search className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {verificationResult && (
            <div
              className={`mt-4 rounded-md p-4 ${
                verificationResult.valid ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex items-start">
                {verificationResult.valid ? (
                  <CheckCircle className="mr-3 h-5 w-5" />
                ) : (
                  <XCircle className="mr-3 h-5 w-5" />
                )}
                <div className="space-y-2">
                  <p className="font-medium">{verificationResult.message}</p>
                  {verificationResult.certificate && (
                    <div className="mt-2">
                      <p className="text-sm">
                        <strong>Certificate Name:</strong> {verificationResult.certificate.metadata.name}
                      </p>
                      <p className="text-sm">
                        <strong>Asset:</strong> {verificationResult.certificate.asset.name}
                      </p>
                      <p className="text-sm">
                        <strong>Current Owner:</strong> {verificationResult.certificate.currentOwner.name}
                      </p>
                      <p className="text-sm">
                        <strong>Issue Date:</strong>{" "}
                        {new Date(verificationResult.certificate.issueDate).toLocaleDateString()}
                      </p>
                      {verificationResult.certificate.onChainCertificateId && (
                        <p className="mt-1 text-sm">
                          <Shield className="mr-1 inline-block h-3 w-3" />
                          Blockchain verified
                        </p>
                      )}
                      <div className="mt-2">
                        <Link href={`/certificates/${verificationResult.certificate.id}`} passHref>
                          <Button size="sm" variant="outline">
                            View Certificate Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
