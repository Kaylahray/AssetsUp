"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import {
  ArrowRight,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  LinkIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { assetApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

type TransferHistoryProps = {
  assetId: string
}

export function TransferHistory({ assetId }: TransferHistoryProps) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true)
      try {
        const response = await assetApi.getAssignmentHistory(assetId)
        setHistory(response.data)
      } catch (error) {
        console.error("Error fetching transfer history:", error)
        toast({
          title: "Error",
          description: "Failed to load transfer history. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [assetId])

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Get transfer type display
  const getTransferTypeDisplay = (type: string) => {
    switch (type) {
      case "user_to_user":
        return "User to User"
      case "user_to_department":
        return "User to Department"
      case "department_to_user":
        return "Department to User"
      case "department_to_department":
        return "Department to Department"
      case "initial_assignment":
        return "Initial Assignment"
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
        <CardTitle>Transfer History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {item.type === "transfer" ? getTransferTypeDisplay(item.transferType) : "Transfer"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(item.date), "PPP")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(item.status)}
                    {item.source === "blockchain" && (
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <LinkIcon className="h-3 w-3" />
                        On-Chain
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  {item.fromUser ? (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{item.fromUser}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{item.fromDepartment}</span>
                    </div>
                  )}

                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />

                  {item.toUser ? (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{item.toUser}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{item.toDepartment}</span>
                    </div>
                  )}
                </div>

                {item.dueDate && (
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Due: {format(new Date(item.dueDate), "PPP")}</span>
                  </div>
                )}

                {item.reason && (
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Reason:</span> {item.reason}
                  </p>
                )}

                {item.notes && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Notes:</span> {item.notes}
                  </p>
                )}

                {item.status === "pending" && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
                    <Clock className="h-3 w-3" />
                    <span>Awaiting approval</span>
                  </div>
                )}

                {item.status === "rejected" && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                    <XCircle className="h-3 w-3" />
                    <span>Request rejected</span>
                  </div>
                )}

                {item.status === "approved" && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Approved, pending completion</span>
                  </div>
                )}

                {item.status === "completed" && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Transfer completed</span>
                  </div>
                )}

                {item.onChainId && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-purple-600">
                    <LinkIcon className="h-3 w-3" />
                    <span className="font-mono text-xs">On-chain ID: {item.onChainId.substring(0, 10)}...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No transfer history found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
