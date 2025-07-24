"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, X, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AssetScannerProps {
  onAssetFound?: (assetId: string, qrData: string) => void
  onClose?: () => void
  autoNavigate?: boolean
}

export function AssetScanner({ onAssetFound, onClose, autoNavigate = true }: AssetScannerProps) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = "qr-reader"

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = () => {
    setIsScanning(true)
    setScannedResult(null)
    setAssetId(null)

    const html5QrCode = new Html5Qrcode(scannerContainerId)
    scannerRef.current = html5QrCode

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure,
      )
      .catch((err) => {
        console.error("Error starting scanner:", err)
        toast({
          title: "Scanner Error",
          description: "Could not start the QR code scanner. Please check camera permissions.",
          variant: "destructive",
        })
        setIsScanning(false)
      })
  }

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false)
        })
        .catch((err) => {
          console.error("Error stopping scanner:", err)
        })
    }
  }

  const onScanSuccess = (decodedText: string) => {
    setScannedResult(decodedText)
    stopScanner()

    try {
      // Try to parse as JSON
      const assetInfo = JSON.parse(decodedText)
      if (assetInfo.id) {
        verifyAsset(assetInfo.id, decodedText)
        return
      }
    } catch (e) {
      // Not valid JSON, continue with URL parsing
    }

    // Extract asset ID from URL if it's a URL
    let extractedAssetId = decodedText
    try {
      const url = new URL(decodedText)
      const pathParts = url.pathname.split("/")
      if (pathParts.includes("assets")) {
        const assetIdIndex = pathParts.indexOf("assets") + 1
        if (assetIdIndex < pathParts.length) {
          extractedAssetId = pathParts[assetIdIndex]
        }
      }
    } catch (e) {
      // Not a URL, use the decoded text as is
      console.log("Not a URL, using decoded text as asset ID")
    }

    verifyAsset(extractedAssetId, decodedText)
  }

  const onScanFailure = (error: string) => {
    // Don't show errors for normal scanning failures
    if (error !== "No QR code found") {
      console.error("Scan error:", error)
    }
  }

  const verifyAsset = async (id: string, qrData: string) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/assets/${id}`)
      setAssetId(id)

      if (onAssetFound) {
        onAssetFound(id, qrData)
      }

      if (autoNavigate) {
        router.push(`/assets/${id}`)
      }
    } catch (error) {
      console.error("Error verifying asset:", error)
      toast({
        title: "Asset Not Found",
        description: "The scanned QR code does not match any asset in the system.",
        variant: "destructive",
      })
      setScannedResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    stopScanner()
    if (onClose) {
      onClose()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="mr-2 h-5 w-5" />
          Asset Scanner
        </CardTitle>
        <CardDescription>Scan an asset QR code to quickly access its information</CardDescription>
      </CardHeader>
      <CardContent>
        {!isScanning && !scannedResult && (
          <div className="flex flex-col items-center justify-center py-8">
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-4">
              Click the button below to start scanning an asset QR code
            </p>
            <Button onClick={startScanner}>
              <Camera className="mr-2 h-4 w-4" />
              Start Scanner
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="space-y-4">
            <div id={scannerContainerId} className="w-full"></div>
            <Button variant="outline" className="w-full" onClick={stopScanner}>
              <X className="mr-2 h-4 w-4" />
              Cancel Scanning
            </Button>
          </div>
        )}

        {scannedResult && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-center text-muted-foreground">Verifying asset...</p>
              </div>
            ) : assetId ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium">Asset Found!</p>
                <p className="text-center text-muted-foreground">
                  Asset ID: {assetId}
                  {autoNavigate && <span className="block">Redirecting to asset details...</span>}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="rounded-full bg-red-100 p-3">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <p className="font-medium">Invalid QR Code</p>
                <p className="text-center text-muted-foreground">The scanned QR code is not a valid asset QR code.</p>
                <Button onClick={startScanner}>Try Again</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={handleClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  )
}
