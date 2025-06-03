"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format, isPast, formatDistanceToNow } from "date-fns"
import { Clock, CheckCircle, AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckoutReturnForm } from "@/components/assets/checkout-return-form"
import type { AssetCheckout } from "@/types"

interface CheckoutDetailProps {
  checkout: AssetCheckout
}

export function CheckoutDetail({ checkout }: CheckoutDetailProps) {
  const router = useRouter()
  const [showReturnDialog, setShowReturnDialog] = useState(false)

  const handleReturnSuccess = () => {
    setShowReturnDialog(false)
    router.refresh()
  }

  const getStatusBadge = () => {
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/assets/checkouts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Checkouts
            </Link>
          </Button>
          {checkout.status === "active" && (
            <Button onClick={() => setShowReturnDialog(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Return Asset
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Checkout Details</CardTitle>
                <CardDescription>Details about this asset checkout</CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Asset</h3>
                  <p className="text-base font-medium">
                    <Link href={`/assets/${checkout.assetId}`} className="hover:underline">
                      {checkout.asset.name}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">{checkout.asset.assetTag}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Checked Out By</h3>
                  <p className="text-base font-medium">
                    <Link href={`/users/${checkout.checkedOutById}`} className="hover:underline">
                      {checkout.checkedOutBy.name}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">{checkout.checkedOutBy.email}</p>
                </div>

                {checkout.status === "returned" && checkout.checkedInBy && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Checked In By</h3>
                    <p className="text-base font-medium">
                      <Link href={`/users/${checkout.checkedInById}`} className="hover:underline">
                        {checkout.checkedInBy.name}
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Checkout Date</h3>
                  <p className="text-base font-medium">{format(new Date(checkout.checkoutDate), "PPP")}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p
                    className={`text-base font-medium ${isPast(new Date(checkout.dueDate)) && checkout.status === "active" ? "text-red-500" : ""}`}
                  >
                    {format(new Date(checkout.dueDate), "PPP")}
                    {checkout.status === "active" && (
                      <span className="text-sm ml-2">
                        (
                        {isPast(new Date(checkout.dueDate))
                          ? `Overdue by ${formatDistanceToNow(new Date(checkout.dueDate))}`
                          : `Due in ${formatDistanceToNow(new Date(checkout.dueDate))}`}
                        )
                      </span>
                    )}
                  </p>
                </div>

                {checkout.status === "returned" && checkout.returnDate && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Return Date</h3>
                    <p className="text-base font-medium">{format(new Date(checkout.returnDate), "PPP")}</p>
                  </div>
                )}
              </div>
            </div>

            {checkout.purpose && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Purpose</h3>
                <p className="text-sm">{checkout.purpose}</p>
              </div>
            )}

            {checkout.notes && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="text-sm">{checkout.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Created on {format(new Date(checkout.createdAt), "PPP")}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>Return the asset and provide any notes about its condition.</DialogDescription>
          </DialogHeader>
          <CheckoutReturnForm checkout={checkout} onSuccess={handleReturnSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
