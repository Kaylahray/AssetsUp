import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCheckout } from "@/components/assets/qr-checkout"

export default function QrCheckoutPage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assets/checkouts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checkouts
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Checkout</CardTitle>
          <CardDescription>Scan an asset's QR code to quickly check it out</CardDescription>
        </CardHeader>
        <CardContent>
          <QrCheckout />
        </CardContent>
      </Card>
    </div>
  )
}
