"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { assetApi, certificateApi } from "@/lib/api"
import type { Asset, AssetCertificate } from "@/types"
import { ArrowLeft, QrCode, Edit, Send, Shield } from "lucide-react"
import Link from "next/link"
import AssetDetails from "@/components/assets/asset-details"
import AssetFiles from "@/components/assets/asset-files"
import MaintenanceHistory from "@/components/assets/maintenance-history"
import AssetAuditTrail from "@/components/audit/asset-audit-trail"
import CertificateCard from "@/components/certificates/certificate-card"

interface AssetDetailPageProps {
  params: {
    id: string
  }
}

export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const router = useRouter()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [certificates, setCertificates] = useState<AssetCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [certificatesLoading, setCertificatesLoading] = useState(true)

  useEffect(() => {
    fetchAsset()
    fetchCertificates()
  }, [params.id])

  const fetchAsset = async () => {
    setLoading(true)
    try {
      const response = await assetApi.getById(params.id)
      setAsset(response.data)
    } catch (error) {
      console.error("Failed to fetch asset:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCertificates = async () => {
    setCertificatesLoading(true)
    try {
      const response = await certificateApi.getAssetCertificates(params.id)
      setCertificates(response.data)
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
    } finally {
      setCertificatesLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <Tabs defaultValue="details">
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Skeleton className="h-64 w-full" />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Asset Not Found</h1>
        </div>
        <p>The requested asset could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{asset.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Link href={`/assets/${asset.id}/qrcode`} passHref>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              QR Code
            </Button>
          </Link>
          <Link href={`/assets/${asset.id}/edit`} passHref>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Link href={`/assets/${asset.id}/transfer`} passHref>
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <AssetDetails asset={asset} />
        </TabsContent>

        <TabsContent value="files">
          <AssetFiles assetId={asset.id} />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceHistory assetId={asset.id} />
        </TabsContent>

        <TabsContent value="audit">
          <AssetAuditTrail assetId={asset.id} limit={10} showViewAll={true} />
        </TabsContent>

        <TabsContent value="certificates">
          {certificatesLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Shield className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Certificates Found</h3>
              <p className="mb-4 text-sm text-gray-500">This asset doesn't have any certificates yet.</p>
              <Link href={`/certificates/new?assetId=${asset.id}`} passHref>
                <Button>
                  <Shield className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {certificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
