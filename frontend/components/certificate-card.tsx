"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type AssetCertificate, CertificateStatus } from "@/types"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Shield, Award, ArrowRight, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CertificateCardProps {
  certificate: AssetCertificate
  showActions?: boolean
}

export default function CertificateCard({ certificate, showActions = true }: CertificateCardProps) {
  const [showQrCode, setShowQrCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerateQrCode = async () => {
    setLoading(true)
    try {
      // This would be a call to generate QR code
      // For now, we'll simulate it
      setQrCodeUrl(`/api/certificates/${certificate.id}/qrcode`)
      setShowQrCode(true)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: CertificateStatus) => {
    switch (status) {
      case CertificateStatus.ACTIVE:
        return "bg-green-100 text-green-800"
      case CertificateStatus.TRANSFERRED:
        return "bg-blue-100 text-blue-800"
      case CertificateStatus.REVOKED:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: CertificateStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full bg-gradient-to-r from-blue-500 to-purple-600">
        {certificate.metadata.imageUrl ? (
          <Image
            src={certificate.metadata.imageUrl || "/placeholder.svg"}
            alt={certificate.metadata.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Award className="h-16 w-16 text-white opacity-50" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white">
          <h3 className="text-lg font-bold">{certificate.metadata.name}</h3>
          <p className="text-sm opacity-90">{certificate.certificateNumber}</p>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(certificate.status)}>{formatStatus(certificate.status)}</Badge>
          {certificate.onChainCertificateId && (
            <Badge variant="outline" className="bg-blue-50">
              <Shield className="mr-1 h-3 w-3" /> On-chain
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Asset</p>
            <p className="font-medium">{certificate.asset.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Value</p>
            <p className="font-medium">{formatCurrency(certificate.assetValue, certificate.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Issued Date</p>
            <p className="font-medium">{formatDate(certificate.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Current Owner</p>
            <p className="font-medium">{certificate.currentOwner.name}</p>
          </div>
        </div>

        {showQrCode && qrCodeUrl && (
          <div className="mt-4 flex justify-center">
            <div className="overflow-hidden rounded-lg border p-2">
              <Image src={qrCodeUrl || "/placeholder.svg"} alt="Certificate QR Code" width={200} height={200} />
            </div>
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleGenerateQrCode} disabled={loading}>
            <QrCode className="mr-1 h-4 w-4" />
            {loading ? "Generating..." : showQrCode ? "Hide QR" : "Show QR"}
          </Button>
          <Link href={`/certificates/${certificate.id}`} passHref>
            <Button size="sm">
              Details
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
