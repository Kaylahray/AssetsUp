"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineBody,
} from "@/components/ui/timeline"
import { type AuditLog, AuditEventType } from "@/types"
import { auditApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { FileText, Shield, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface AssetAuditTrailProps {
  assetId: string
  limit?: number
  showViewAll?: boolean
}

export default function AssetAuditTrail({ assetId, limit = 5, showViewAll = true }: AssetAuditTrailProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [assetId])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await auditApi.getAssetAuditTrail(assetId)
      setLogs(response.data.slice(0, limit))
    } catch (error) {
      console.error("Failed to fetch asset audit trail:", error)
    } finally {
      setLoading(false)
    }
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

  const formatEventType = (eventType: AuditEventType) => {
    return eventType
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getEventIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case AuditEventType.ASSET_CREATED:
        return <FileText className="h-4 w-4" />
      case AuditEventType.ASSET_TRANSFERRED:
      case AuditEventType.ASSET_ASSIGNED:
      case AuditEventType.ASSET_UNASSIGNED:
        return <ArrowRight className="h-4 w-4" />
      case AuditEventType.ASSET_MAINTENANCE:
        return <AlertTriangle className="h-4 w-4" />
      case AuditEventType.ASSET_DECOMMISSIONED:
        return <AlertTriangle className="h-4 w-4" />
      case AuditEventType.CERTIFICATE_ISSUED:
      case AuditEventType.CERTIFICATE_TRANSFERRED:
      case AuditEventType.CERTIFICATE_REVOKED:
        return <Shield className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Audit Trail</CardTitle>
          <CardDescription>Track all changes and events related to this asset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Audit Trail</CardTitle>
        <CardDescription>Track all changes and events related to this asset</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-12 w-12 text-gray-400" />
            <h3 className="mb-1 text-lg font-semibold">No audit logs found</h3>
            <p className="text-sm text-gray-500">There are no audit logs for this asset yet.</p>
          </div>
        ) : (
          <Timeline>
            {logs.map((log, index) => (
              <TimelineItem key={log.id}>
                {index < logs.length - 1 && <TimelineConnector />}
                <TimelineHeader>
                  <TimelineIcon>
                    {log.verified ? <CheckCircle className="h-4 w-4 text-green-500" /> : getEventIcon(log.eventType)}
                  </TimelineIcon>
                  <TimelineTitle className="flex items-center gap-2">
                    <Badge className={getEventTypeColor(log.eventType)}>{formatEventType(log.eventType)}</Badge>
                    <span className="text-sm text-gray-500">{formatDate(log.createdAt)}</span>
                  </TimelineTitle>
                </TimelineHeader>
                <TimelineBody className="pt-2">
                  <div className="space-y-1">
                    {log.performedBy ? (
                      <p className="text-sm">
                        Performed by{" "}
                        <Link href={`/users/${log.performedById}`} className="font-medium hover:underline">
                          {log.performedBy.name}
                        </Link>
                      </p>
                    ) : (
                      <p className="text-sm">Performed by System</p>
                    )}
                    {log.onChainLogId && (
                      <p className="text-xs text-gray-500">
                        <Shield className="mr-1 inline-block h-3 w-3" />
                        Recorded on blockchain
                      </p>
                    )}
                    <div className="mt-2">
                      <Link href={`/audit/logs/${log.id}`} passHref>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </TimelineBody>
              </TimelineItem>
            ))}
          </Timeline>
        )}

        {showViewAll && logs.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Link href={`/audit/logs?assetId=${assetId}`} passHref>
              <Button variant="outline">View All Audit Logs</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
