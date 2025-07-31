"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type AuditLog, AuditEventType } from "@/types"
import { auditApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { CheckCircle, AlertTriangle, ArrowLeft, Shield, ExternalLink } from "lucide-react"
import Link from "next/link"
import { JSONTree } from "react-json-tree"

interface AuditLogDetailProps {
  logId: string
}

export default function AuditLogDetail({ logId }: AuditLogDetailProps) {
  const router = useRouter()
  const [log, setLog] = useState<AuditLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [blockchainData, setBlockchainData] = useState<any | null>(null)
  const [loadingBlockchainData, setLoadingBlockchainData] = useState(false)

  useEffect(() => {
    fetchLog()
  }, [logId])

  const fetchLog = async () => {
    setLoading(true)
    try {
      const response = await auditApi.getLogs({ id: logId })
      if (response.data && response.data.length > 0) {
        setLog(response.data[0])
        if (response.data[0].onChainLogId) {
          fetchBlockchainData(response.data[0].onChainLogId)
        }
      }
    } catch (error) {
      console.error("Failed to fetch audit log:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockchainData = async (onChainLogId: string) => {
    setLoadingBlockchainData(true)
    try {
      // This would be a call to get blockchain data
      // For now, we'll simulate it
      const blockchainResponse = {
        logId: onChainLogId,
        transactionHash: log?.transactionHash || "0x...",
        blockNumber: 12345678,
        timestamp: new Date().getTime(),
        verified: log?.verified || false,
      }
      setBlockchainData(blockchainResponse)
    } catch (error) {
      console.error("Failed to fetch blockchain data:", error)
    } finally {
      setLoadingBlockchainData(false)
    }
  }

  const handleVerifyLog = async () => {
    if (!log) return

    setVerifying(true)
    try {
      await auditApi.verifyAuditLog(log.id)
      fetchLog() // Refresh log after verification
    } catch (error) {
      console.error("Failed to verify audit log:", error)
    } finally {
      setVerifying(false)
    }
  }

  const formatEventType = (eventType: AuditEventType) => {
    return eventType
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getEventTypeColor = (eventType: AuditEventType) => {
    switch (eventType) {
      case AuditEventType.ASSET_CREATED:
      case AuditEventType.INVENTORY_CREATED:
      case AuditEventType.CERTIFICATE_ISSUED:
        return "bg-green-100 text-green-800"
      case AuditEventType.ASSET_DELETED:
      case AuditEventType.ASSET_DECOMMISSIONED:
      case AuditEventType.CERTIFICATE_REVOKED:
        return "bg-red-100 text-red-800"
      case AuditEventType.ASSET_TRANSFERRED:
      case AuditEventType.ASSET_ASSIGNED:
      case AuditEventType.ASSET_UNASSIGNED:
      case AuditEventType.CERTIFICATE_TRANSFERRED:
        return "bg-blue-100 text-blue-800"
      case AuditEventType.ASSET_CHECKED_OUT:
      case AuditEventType.ASSET_CHECKED_IN:
        return "bg-purple-100 text-purple-800"
      case AuditEventType.ASSET_MAINTENANCE:
        return "bg-yellow-100 text-yellow-800"
      case AuditEventType.INVENTORY_TRANSACTION:
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-8 w-[300px]" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-[200px]" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!log) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Not Found</CardTitle>
          <CardDescription>The requested audit log could not be found.</CardDescription>
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
            <CardTitle>Audit Log Details</CardTitle>
            <CardDescription>Detailed information about this audit log entry</CardDescription>
          </div>
          <Badge className={getEventTypeColor(log.eventType)}>{formatEventType(log.eventType)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="eventData">Event Data</TabsTrigger>
            {log.onChainLogId && <TabsTrigger value="blockchain">Blockchain</TabsTrigger>}
          </TabsList>

          <TabsContent value="details">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Log ID</p>
                <p className="font-mono text-sm">{log.id}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Event Type</p>
                <p>{formatEventType(log.eventType)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p>{formatDate(log.createdAt)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Verification Status</p>
                <div className="flex items-center">
                  {log.verified ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      <span>Verified</span>
                      {log.verifiedAt && (
                        <span className="ml-2 text-sm text-gray-500">({formatDate(log.verifiedAt)})</span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      <span>Not Verified</span>
                    </>
                  )}
                </div>
              </div>

              {log.asset && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Asset</p>
                  <Link href={`/assets/${log.assetId}`} className="text-blue-600 hover:underline">
                    {log.asset.name}
                  </Link>
                </div>
              )}

              {log.user && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">User</p>
                  <Link href={`/users/${log.userId}`} className="text-blue-600 hover:underline">
                    {log.user.name}
                  </Link>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Performed By</p>
                {log.performedBy ? (
                  <Link href={`/users/${log.performedById}`} className="text-blue-600 hover:underline">
                    {log.performedBy.name}
                  </Link>
                ) : (
                  <span>System</span>
                )}
              </div>

              {log.onChainLogId && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">On-Chain Log ID</p>
                  <p className="font-mono text-sm">{log.onChainLogId}</p>
                </div>
              )}

              {log.transactionHash && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
                  <div className="flex items-center">
                    <p className="font-mono text-sm truncate">{log.transactionHash}</p>
                    <a
                      href={`https://voyager.online/tx/${log.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}

              {log.ipAddress && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">IP Address</p>
                  <p>{log.ipAddress}</p>
                </div>
              )}

              {log.userAgent && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">User Agent</p>
                  <p className="text-sm">{log.userAgent}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="eventData">
            <div className="rounded-md bg-gray-50 p-4">
              <JSONTree data={log.eventData} theme="bright" invertTheme={false} />
            </div>
          </TabsContent>

          {log.onChainLogId && (
            <TabsContent value="blockchain">
              {loadingBlockchainData ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : blockchainData ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">Blockchain Data</h3>
                    <JSONTree data={blockchainData} theme="bright" invertTheme={false} />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-blue-50 p-4 text-blue-800">
                    <Shield className="h-5 w-5" />
                    <p>
                      This log entry has been recorded on the StarkNet blockchain, ensuring its immutability and
                      providing a tamper-proof audit trail.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-amber-50 p-4 text-amber-800">
                  <p>Failed to load blockchain data. Please try again later.</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {!log.verified && (
          <Button onClick={handleVerifyLog} disabled={verifying}>
            <Shield className="mr-2 h-4 w-4" />
            {verifying ? "Verifying..." : "Verify Log"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
