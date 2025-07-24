"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowRight, User, Building2, Calendar, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { assetApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

export function PendingTransfers() {
  const router = useRouter()
  const [transfers, setTransfers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchTransfers = async () => {
    setIsLoading(true)
    try {
      const response = await assetApi.getPendingTransfers()
      setTransfers(response.data)
    } catch (error) {
      console.error("Error fetching pending transfers:", error)
      toast({
        title: "Error",
        description: "Failed to load pending transfers. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [])

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

  const handleApprove = async (transferId: string) => {
    setIsProcessing(true)
    try {
      await assetApi.approveTransfer(transferId)
      toast({
        title: "Transfer Approved",
        description: "The asset transfer has been approved successfully.",
      })
      fetchTransfers()
    } catch (error) {
      console.error("Error approving transfer:", error)
      toast({
        title: "Error",
        description: "Failed to approve transfer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedTransfer) return

    setIsProcessing(true)
    try {
      await assetApi.rejectTransfer(selectedTransfer.id, { notes: rejectReason })
      toast({
        title: "Transfer Rejected",
        description: "The asset transfer has been rejected.",
      })
      setRejectDialogOpen(false)
      setRejectReason("")
      setSelectedTransfer(null)
      fetchTransfers()
    } catch (error) {
      console.error("Error rejecting transfer:", error)
      toast({
        title: "Error",
        description: "Failed to reject transfer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Transfer Requests</CardTitle>
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Transfer Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length > 0 ? (
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{getTransferTypeDisplay(transfer.transferType)}</h3>
                      <p className="text-sm text-muted-foreground">{format(new Date(transfer.transferDate), "PPP")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/assets/${transfer.assetId}`)}>
                        View Asset
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Asset:</span> {transfer.asset.name} ({transfer.asset.assetTag})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {transfer.fromUser ? (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.fromUser.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.fromDepartment}</span>
                      </div>
                    )}

                    <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />

                    {transfer.toUser ? (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.toUser.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{transfer.toDepartment}</span>
                      </div>
                    )}
                  </div>

                  {transfer.dueDate && (
                    <div className="flex items-center gap-1 mt-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Due: {format(new Date(transfer.dueDate), "PPP")}</span>
                    </div>
                  )}

                  {transfer.reason && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Reason:</span> {transfer.reason}
                    </p>
                  )}

                  {transfer.requestedBy && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Requested by:</span> {transfer.requestedBy.name}
                    </p>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTransfer(transfer)
                        setRejectDialogOpen(true)
                      }}
                      disabled={isProcessing}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(transfer.id)} disabled={isProcessing}>
                      {isProcessing ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No pending transfer requests</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transfer Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this transfer request.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false)
                setRejectReason("")
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
