"use client"

import { useState } from "react"
import Link from "next/link"
import { format, isPast } from "date-fns"
import { Clock, CheckCircle, AlertTriangle, Eye, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckoutReturnForm } from "@/components/assets/checkout-return-form"
import type { AssetCheckout } from "@/types"

interface CheckoutListProps {
  checkouts: AssetCheckout[]
  onReturn?: () => void
}

export function CheckoutList({ checkouts, onReturn }: CheckoutListProps) {
  const [selectedCheckout, setSelectedCheckout] = useState<AssetCheckout | null>(null)
  const [showReturnDialog, setShowReturnDialog] = useState(false)

  const handleReturn = (checkout: AssetCheckout) => {
    setSelectedCheckout(checkout)
    setShowReturnDialog(true)
  }

  const handleReturnSuccess = () => {
    setShowReturnDialog(false)
    if (onReturn) {
      onReturn()
    }
  }

  const getStatusBadge = (checkout: AssetCheckout) => {
    switch (checkout.status) {
      case "active":
        return isPast(new Date(checkout.dueDate)) ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Active
          </Badge>
        )
      case "returned":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Returned
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Overdue
          </Badge>
        )
      default:
        return <Badge>{checkout.status}</Badge>
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Checkout Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No checkouts found
                </TableCell>
              </TableRow>
            ) : (
              checkouts.map((checkout) => (
                <TableRow key={checkout.id}>
                  <TableCell className="font-medium">
                    <Link href={`/assets/${checkout.assetId}`} className="hover:underline">
                      {checkout.asset.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{checkout.asset.assetTag}</div>
                  </TableCell>
                  <TableCell>{format(new Date(checkout.checkoutDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div
                      className={
                        isPast(new Date(checkout.dueDate)) && checkout.status === "active" ? "text-red-500" : ""
                      }
                    >
                      {format(new Date(checkout.dueDate), "MMM d, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(checkout)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/assets/checkouts/${checkout.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {checkout.status === "active" && (
                        <Button variant="ghost" size="icon" onClick={() => handleReturn(checkout)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>Return the asset and provide any notes about its condition.</DialogDescription>
          </DialogHeader>
          {selectedCheckout && <CheckoutReturnForm checkout={selectedCheckout} onSuccess={handleReturnSuccess} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
