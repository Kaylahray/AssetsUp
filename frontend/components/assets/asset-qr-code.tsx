"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { Asset } from "@/types"

interface AssetQRCodeProps {
  asset: Asset
  baseUrl?: string
}

export function AssetQRCode({ asset, baseUrl = "https://assets.example.com" }: AssetQRCodeProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  const qrValue = `${baseUrl}/assets/${asset.id}`

  const downloadQRCode = () => {
    setIsDownloading(true)
    try {
      const svg = document.getElementById("asset-qr-code")
      if (!svg) {
        throw new Error("QR code element not found")
      }

      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")

        // Download the PNG file
        const downloadLink = document.createElement("a")
        downloadLink.download = `${asset.assetTag || asset.id}-qr-code.png`
        downloadLink.href = pngFile
        downloadLink.click()

        setIsDownloading(false)
      }

      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      })
      setIsDownloading(false)
    }
  }

  const printQRCode = () => {
    setIsPrinting(true)
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        throw new Error("Could not open print window")
      }

      const svg = document.getElementById("asset-qr-code")
      if (!svg) {
        throw new Error("QR code element not found")
      }

      const svgData = new XMLSerializer().serializeToString(svg)
      const imgSrc = "data:image/svg+xml;base64," + btoa(svgData)

      printWindow.document.write(`
        <html>
          <head>
            <title>Asset QR Code - ${asset.name}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ccc;
              }
              .qr-code {
                margin: 20px 0;
              }
              .asset-info {
                margin-top: 20px;
                text-align: left;
              }
              .asset-info p {
                margin: 5px 0;
              }
              @media print {
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${asset.name}</h2>
              <div class="qr-code">
                <img src="${imgSrc}" alt="Asset QR Code" width="200" height="200" />
              </div>
              <div class="asset-info">
                <p><strong>Asset Tag:</strong> ${asset.assetTag || "N/A"}</p>
                <p><strong>Serial Number:</strong> ${asset.serialNumber || "N/A"}</p>
                <p><strong>Category:</strong> ${asset.category || "N/A"}</p>
                <p><strong>Department:</strong> ${asset.department || "N/A"}</p>
              </div>
            </div>
            <div class="no-print" style="margin-top: 20px;">
              <button onclick="window.print()">Print</button>
              <button onclick="window.close()">Close</button>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              }
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()
      setIsPrinting(false)
    } catch (error) {
      console.error("Error printing QR code:", error)
      toast({
        title: "Error",
        description: "Failed to print QR code",
        variant: "destructive",
      })
      setIsPrinting(false)
    }
  }

  const shareQRCode = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Web Share API is not supported in your browser",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.share({
        title: `QR Code for ${asset.name}`,
        text: `Scan this QR code to view details for asset: ${asset.name} (${asset.assetTag || asset.id})`,
        url: qrValue,
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast({
        title: "Error",
        description: "Failed to share QR code",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset QR Code</CardTitle>
        <CardDescription>Scan to quickly access asset information</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="border p-4 rounded-lg bg-white">
          <QRCodeSVG
            id="asset-qr-code"
            value={qrValue}
            size={200}
            level="H"
            includeMargin
            imageSettings={{
              src: "/logo.png",
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Asset: {asset.name} ({asset.assetTag || asset.serialNumber || asset.id})
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center space-x-2">
        <Button variant="outline" size="sm" onClick={downloadQRCode} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download"}
        </Button>
        <Button variant="outline" size="sm" onClick={printQRCode} disabled={isPrinting}>
          <Printer className="mr-2 h-4 w-4" />
          {isPrinting ? "Printing..." : "Print"}
        </Button>
        {navigator.share && (
          <Button variant="outline" size="sm" onClick={shareQRCode}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
