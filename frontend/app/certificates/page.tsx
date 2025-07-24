"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AssetCertificate } from "@/types"
import { certificateApi } from "@/lib/api"
import CertificateCard from "@/components/certificates/certificate-card"
import { Plus, Award } from "lucide-react"
import Link from "next/link"

export default function CertificatesPage() {
  const router = useRouter()
  const [certificates, setCertificates] = useState<AssetCertificate[]>([])
  const [myCertificates, setMyCertificates] = useState<AssetCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const [allResponse, myResponse] = await Promise.all([certificateApi.getAll(), certificateApi.getMyCertificates()])
      setCertificates(allResponse.data)
      setMyCertificates(myResponse.data)
    } catch (error) {
      console.error("Failed to fetch certificates:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asset Certificates</h1>
        <Link href="/certificates/new" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Issue Certificate
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="my">My Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200"></div>
              ))}
            </div>
          ) : certificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Award className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Certificates Found</h3>
              <p className="mb-4 text-sm text-gray-500">There are no certificates in the system yet.</p>
              <Link href="/certificates/new" passHref>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
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

        <TabsContent value="my">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-gray-200"></div>
              ))}
            </div>
          ) : myCertificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <Award className="mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold">No Certificates Found</h3>
              <p className="text-sm text-gray-500">You don't own any certificates yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myCertificates.map((certificate) => (
                <CertificateCard key={certificate.id} certificate={certificate} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
