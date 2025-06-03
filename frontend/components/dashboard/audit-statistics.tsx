"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { auditApi } from "@/lib/api"
import { Shield, FileText, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AuditStatistics() {
  const [stats, setStats] = useState<{
    totalLogs: number
    onChainLogs: number
    verifiedLogs: number
    unverifiedLogs: number
    recentEventTypes: { type: string; count: number }[]
    integrityStatus: "verified" | "unverified" | "compromised"
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await auditApi.getAuditStatistics()
      setStats(response.data)
    } catch (error) {
      console.error("Failed to fetch audit statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Statistics</CardTitle>
          <CardDescription>Overview of system audit logs and blockchain verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="mb-2 h-10 w-10 text-amber-500" />
            <h3 className="text-lg font-semibold">Failed to load statistics</h3>
            <p className="text-sm text-gray-500">Please try again later</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={fetchStats}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Audit Statistics
        </CardTitle>
        <CardDescription>Overview of system audit logs and blockchain verification</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-500">Total Logs</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-2xl font-bold">{stats.totalLogs}</div>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm font-medium text-blue-700">On-Chain Logs</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-2xl font-bold">{stats.onChainLogs}</div>
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm font-medium text-green-700">Verified Logs</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-2xl font-bold">{stats.verifiedLogs}</div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-4">
            <div className="text-sm font-medium text-amber-700">Unverified Logs</div>
            <div className="mt-1 flex items-end justify-between">
              <div className="text-2xl font-bold">{stats.unverifiedLogs}</div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Recent Event Types</h3>
          <div className="space-y-2">
            {stats.recentEventTypes.map((event) => (
              <div key={event.type} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
                <span className="text-sm">{event.type}</span>
                <span className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium">{event.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`rounded-md p-3 ${
            stats.integrityStatus === "verified"
              ? "bg-green-50 text-green-800"
              : stats.integrityStatus === "unverified"
                ? "bg-amber-50 text-amber-800"
                : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-start">
            {stats.integrityStatus === "verified" ? (
              <CheckCircle className="mr-2 h-5 w-5" />
            ) : stats.integrityStatus === "unverified" ? (
              <AlertTriangle className="mr-2 h-5 w-5" />
            ) : (
              <AlertTriangle className="mr-2 h-5 w-5" />
            )}
            <div>
              <p className="font-medium">
                {stats.integrityStatus === "verified"
                  ? "Blockchain Integrity Verified"
                  : stats.integrityStatus === "unverified"
                    ? "Blockchain Integrity Not Verified"
                    : "Blockchain Integrity Compromised"}
              </p>
              <p className="text-sm">
                {stats.integrityStatus === "verified"
                  ? "All on-chain records have been verified and are intact."
                  : stats.integrityStatus === "unverified"
                    ? "On-chain records have not been verified recently."
                    : "Some on-chain records may have been tampered with."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/audit/logs" passHref>
          <Button variant="outline" className="w-full">
            View All Audit Logs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
