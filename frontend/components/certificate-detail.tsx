"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type AssetCertificate, CertificateStatus, type User } from "@/types"
import { certificateApi, userApi } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import {
  Shield,
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  QrCode,
  ExternalLink,
  Send,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface CertificateDetailProps {
  certificateId: string
}

export default function CertificateDetail({ certificateId }: CertificateDetailProps) {
  const router = useRouter()
  const [certificate, setCertificate] = useState<AssetCertificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loadingQrCode, setLoadingQrCode] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false)
  const [revocationReason, setRevocationReason] = useState("")
  const [transferring, setTransferring] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean
    blockchainVerified: boolean
  } | null>(null)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchCertificate()
    fetchUsers()
  }, [certificateId])

  const fetchCertificate = async () => {
    setLoading(true)
    try {
      const response = await certificateApi.getById(certificateId)
      setCertificate(response.data)
    } catch (error) {
      console.error("Failed to fetch certificate:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll()
      setUsers(response.data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }

  const handleGenerateQrCode = async () => {
    if (!certificate) return

    setLoadingQrCode(true)
    try {
      const response = await certificateApi.generateQrCode(certificate.id)
      setQrCodeUrl(response.data.qrCodeUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setLoadingQrCode(false)
    }
  }

  const handleTransferCertificate = async () => {
    if (!certificate || !selectedUserId) return

    setTransferring(true)
    try {
      await certificateApi.transferCertificate(certificate.id, selectedUserId)
      toast({
        title: "Certificate Transferred",
        description: "The certificate has been successfully transferred.",
      })
      setTransferDialogOpen(false)
      fetchCertificate() // Refresh certificate data
    } catch (error) {
      console.error("Failed to transfer certificate:", error)
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer the certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTransferring(false)
    }
  }

  const handleRevokeCertificate = async () => {
    if (!certificate || !revocationReason) return

    setRevoking(true)
    try {
      await certificateApi.revokeCertificate(certificate.id, revocationReason)
      toast({
        title: "Certificate Revoked",
        description: "The certificate has been successfully revoked.",
      })
      setRevokeDialogOpen(false)
      fetchCertificate() // Refresh certificate data
    } catch (error) {
      console.error("Failed to revoke certificate:", error)
      toast({
        title: "Revocation Failed",
        description: "Failed to revoke the certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setRevoking(false)
    }
  }

  const handleVerifyCertificate = async () => {
    if (!certificate) return

    setVerifying(true)
    try {
      const response = await certificateApi.verifyCertificate(certificate.id)
      setVerificationResult(response.data)
    } catch (error) {
      console.error("Failed to verify certificate:", error)
      toast({
        title: "Verification Failed",
        description: "Failed to verify the certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVerifying(false)
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-5 w-full animate-pulse rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!certificate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate Not Found</CardTitle>
          <CardDescription>The requested certificate could not be found.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{certificate.metadata.name}</CardTitle>
            <CardDescription>Certificate #{certificate.certificateNumber}</CardDescription>
          </div>
          <Badge className={getStatusColor(certificate.status)}>{formatStatus(certificate.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="asset">Asset</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="mb-6 overflow-hidden rounded-lg">
              {certificate.metadata.imageUrl ? (
                <div className="relative h-64 w-full">
                  <Image
                    src={certificate.metadata.imageUrl || "/placeholder.svg"}
                    alt={certificate.metadata.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                  <Award className="h-24 w-24 text-white opacity-50" />
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Certificate Number</p>
                <p className="font-mono">{certificate.certificateNumber}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={getStatusColor(certificate.status)}>{formatStatus(certificate.status)}</Badge>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p>{formatDate(certificate.issueDate)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Asset Value</p>
                <p className="font-semibold">{formatCurrency(certificate.assetValue, certificate.currency)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Issued To</p>
                <Link href={`/users/${certificate.issuedToId}`} className="text-blue-600 hover:underline">
                  {certificate.issuedTo.name}
                </Link>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Current Owner</p>
                <Link href={`/users/${certificate.currentOwnerId}`} className="text-blue-600 hover:underline">
                  {certificate.currentOwner.name}
                </Link>
              </div>

              {certificate.status === CertificateStatus.REVOKED && certificate.revocationReason && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm font-medium text-gray-500">Revocation Reason</p>
                  <p className="rounded-md bg-red-50 p-2 text-red-800">{certificate.revocationReason}</p>
                  {certificate.revocationDate && (
                    <p className="text-xs text-gray-500">Revoked on {formatDate(certificate.revocationDate)}</p>
                  )}
                </div>
              )}

              {certificate.onChainCertificateId && (
                <div className="col-span-2 space-y-1">
                  <p className="text-sm font-medium text-gray-500">Blockchain Certificate ID</p>
                  <div className="flex items-center">
                    <p className="font-mono text-sm">{certificate.onChainCertificateId}</p>
                    <a
                      href={`https://voyager.online/contract/${certificate.onChainCertificateId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="col-span-2 space-y-1">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p>{certificate.metadata.description}</p>
              </div>

              {certificate.metadata.attributes && Object.keys(certificate.metadata.attributes).length > 0 && (
                <div className="col-span-2 space-y-2">
                  <p className="text-sm font-medium text-gray-500">Attributes</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {Object.entries(certificate.metadata.attributes).map(([key, value]) => (
                      <div key={key} className="rounded-md bg-gray-50 p-2">
                        <p className="text-xs font-medium text-gray-500">{key}</p>
                        <p>{value as string}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {qrCodeUrl && (
                <div className="col-span-2 mt-4 flex justify-center">
                  <div className="overflow-hidden rounded-lg border p-4">
                    <Image src={qrCodeUrl || "/placeholder.svg"} alt="Certificate QR Code" width={250} height={250} />
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Scan this QR code to verify the certificate
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="asset">
            <div className="rounded-md border p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{certificate.asset.name}</h3>
                  <p className="text-sm text-gray-500">
                    {certificate.asset.category} • {certificate.asset.status}
                  </p>
                </div>
                <Link href={`/assets/${certificate.assetId}`} passHref>
                  <Button variant="outline" size="sm">
                    View Asset
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Serial Number</p>
                  <p className="font-mono text-sm">{certificate.asset.serialNumber || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Asset Tag</p>
                  <p>{certificate.asset.assetTag || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Condition</p>
                  <p>{certificate.asset.condition}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p>{certificate.asset.location || "N/A"}</p>
                </div>

                {certificate.asset.purchaseDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                    <p>{formatDate(certificate.asset.purchaseDate)}</p>
                  </div>
                )}

                {certificate.asset.purchasePrice && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Purchase Price</p>
                    <p>{formatCurrency(certificate.asset.purchasePrice)}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-6">
              <div className="rounded-md bg-blue-50 p-4 text-blue-800">
                <div className="flex items-start">
                  <Shield className="mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">Blockchain Verification</h3>
                    <p className="text-sm">
                      This certificate is stored on the StarkNet blockchain, providing an immutable record of ownership
                      and authenticity.
                    </p>
                  </div>
                </div>
              </div>

              {certificate.certificateHash && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Certificate Hash</p>
                  <p className="break-all rounded-md bg-gray-50 p-2 font-mono text-xs">{certificate.certificateHash}</p>
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={handleVerifyCertificate} disabled={verifying}>
                  <Shield className="mr-2 h-4 w-4" />
                  {verifying ? "Verifying..." : "Verify Certificate"}
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
                    <div>
                      <h3 className="font-semibold">
                        {verificationResult.valid ? "Certificate is Valid" : "Certificate is Invalid"}
                      </h3>
                      <p className="text-sm">
                        {verificationResult.valid
                          ? "This certificate has been verified and is authentic."
                          : "This certificate could not be verified or has been revoked."}
                      </p>
                      {verificationResult.blockchainVerified && (
                        <p className="mt-2 text-sm">
                          <Shield className="mr-1 inline-block h-4 w-4" />
                          Blockchain verification successful
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex space-x-2">
          {!qrCodeUrl && (
            <Button variant="outline" onClick={handleGenerateQrCode} disabled={loadingQrCode}>
              <QrCode className="mr-2 h-4 w-4" />
              {loadingQrCode ? "Generating..." : "Generate QR Code"}
            </Button>
          )}

          {certificate.status === CertificateStatus.ACTIVE && (
            <>
              <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Transfer Certificate</DialogTitle>
                    <DialogDescription>
                      Transfer this certificate to another user. This action will be recorded on the blockchain.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Select User</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users
                            .filter((user) => user.id !== certificate.currentOwnerId)
                            .map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleTransferCertificate} disabled={!selectedUserId || transferring}>
                      {transferring ? "Transferring..." : "Transfer Certificate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Revoke
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Revoke Certificate</DialogTitle>
                    <DialogDescription>
                      Revoke this certificate. This action cannot be undone and will be recorded on the blockchain.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Revocation</Label>
                      <Textarea
                        id="reason"
                        value={revocationReason}
                        onChange={(e) => setRevocationReason(e.target.value)}
                        placeholder="Enter the reason for revoking this certificate"
                        rows={4}
                      />
                    </div>
                    <div className="rounded-md bg-amber-50 p-3 text-amber-800">
                      <div className="flex items-start">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        <p className="text-sm">
                          Warning: Revoking a certificate is permanent and cannot be undone. The certificate will no
                          longer be valid.
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRevokeCertificate}
                      disabled={!revocationReason || revoking}
                    >
                      {revoking ? "Revoking..." : "Revoke Certificate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
