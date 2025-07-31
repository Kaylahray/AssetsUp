"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { type AuditLog, AuditEventType } from "@/types"
import { auditApi } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { CheckCircle, AlertTriangle, FileText, Search, Shield } from "lucide-react"
import Link from "next/link"

interface AuditLogListProps {
  assetId?: string
  userId?: string
  eventType?: AuditEventType
  limit?: number
  showPagination?: boolean
  showFilters?: boolean
  title?: string
  description?: string
}

export default function AuditLogList({
  assetId,
  userId,
  eventType,
  limit = 10,
  showPagination = true,
  showFilters = true,
  title = "Audit Logs",
  description = "View and verify system audit logs",
}: AuditLogListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEventType, setSelectedEventType] = useState<AuditEventType | undefined>(eventType)
  const [verifying, setVerifying] = useState<string | null>(null)

  useEffect(() => {
    const pageParam = searchParams.get("page")
    if (pageParam) {
      setPage(Number.parseInt(pageParam))
    }

    const eventTypeParam = searchParams.get("eventType") as AuditEventType | null
    if (eventTypeParam) {
      setSelectedEventType(eventTypeParam)
    }

    fetchLogs()
  }, [page, selectedEventType, assetId, userId])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit,
      }

      if (assetId) {
        params.assetId = assetId
      }

      if (userId) {
        params.userId = userId
      }

      if (selectedEventType) {
        params.eventType = selectedEventType
      }

      const response = await auditApi.getLogs(params)
      setLogs(response.data)
      setTotalPages(Math.ceil(response.headers["x-total-count"] / limit))
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`?${params.toString()}`)
  }

  const handleEventTypeChange = (newEventType: AuditEventType | undefined) => {
    setSelectedEventType(newEventType)
    setPage(1)
    const params = new URLSearchParams(searchParams.toString())
    if (newEventType) {
      params.set("eventType", newEventType)
    } else {
      params.delete("eventType")
    }
    params.set("page", "1")
    router.push(`?${params.toString()}`)
  }

  const handleVerifyLog = async (logId: string) => {
    setVerifying(logId)
    try {
      await auditApi.verifyAuditLog(logId)
      fetchLogs() // Refresh logs after verification
    } catch (error) {
      console.error("Failed to verify audit log:", error)
    } finally {
      setVerifying(null)
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant={selectedEventType === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => handleEventTypeChange(undefined)}
            >
              All
            </Button>
            {Object.values(AuditEventType).map((type) => (
              <Button
                key={type}
                variant={selectedEventType === type ? "default" : "outline"}
                size="sm"
                onClick={() => handleEventTypeChange(type)}
              >
                {formatEventType(type)}
              </Button>
            ))}
          </div>
        )}

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="mb-2 h-12 w-12 text-gray-400" />
            <h3 className="mb-1 text-lg font-semibold">No audit logs found</h3>
            <p className="text-sm text-gray-500">There are no audit logs matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Blockchain</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={getEventTypeColor(log.eventType)}>{formatEventType(log.eventType)}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.asset ? (
                        <Link href={`/assets/${log.assetId}`} className="hover:underline">
                          {log.asset.name}
                        </Link>
                      ) : (
                        log.assetId || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <Link href={`/users/${log.userId}`} className="hover:underline">
                          {log.user.name}
                        </Link>
                      ) : (
                        log.userId || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {log.performedBy ? (
                        <Link href={`/users/${log.performedById}`} className="hover:underline">
                          {log.performedBy.name}
                        </Link>
                      ) : (
                        "System"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      {log.onChainLogId ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          On-chain
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700">
                          Off-chain
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.verified ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/audit/logs/${log.id}`)}>
                          <Search className="mr-1 h-4 w-4" />
                          Details
                        </Button>
                        {!log.verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyLog(log.id)}
                            disabled={verifying === log.id}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            {verifying === log.id ? "Verifying..." : "Verify"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {showPagination && totalPages > 1 && (
          <Pagination className="mt-4">
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(page - 1)}>Previous</PaginationLink>
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={pageNum === page}>
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(page + 1)}>Next</PaginationLink>
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </CardContent>
    </Card>
  )
}
