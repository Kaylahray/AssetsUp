"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addDays } from "date-fns"
import { CalendarIcon, Loader2, QrCode, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { checkoutApi } from "@/lib/api"
import { AssetScanner } from "@/components/assets/asset-scanner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  dueDate: z.date().refine((date) => date > new Date(), {
    message: "Due date must be in the future",
  }),
  purpose: z.string().min(3, "Purpose is required").max(500),
})

export function QrCheckout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scannedAssetData, setScannedAssetData] = useState<string | null>(null)
  const [assetInfo, setAssetInfo] = useState<{ id: string; name: string; assetTag: string } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dueDate: addDays(new Date(), 7), // Default to 7 days from now
      purpose: "",
    },
  })

  const handleScan = (assetId: string, qrData: string) => {
    setShowScanner(false)
    setScannedAssetData(qrData)

    try {
      const parsedData = JSON.parse(qrData)
      setAssetInfo({
        id: parsedData.id,
        name: parsedData.name || "Unknown Asset",
        assetTag: parsedData.assetTag || "No Tag",
      })
    } catch (error) {
      console.error("Error parsing QR data:", error)
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not in the correct format.",
        variant: "destructive",
      })
      setScannedAssetData(null)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!scannedAssetData) {
      toast({
        title: "No Asset Scanned",
        description: "Please scan an asset QR code first.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await checkoutApi.checkoutByQrCode(scannedAssetData, values.dueDate, values.purpose)

      toast({
        title: "Asset Checked Out",
        description: "The asset has been checked out successfully.",
      })

      router.push("/assets/checkouts")
      router.refresh()
    } catch (error) {
      console.error("Error checking out asset:", error)
      toast({
        title: "Error",
        description: "Failed to check out asset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {showScanner ? (
        <AssetScanner
          onAssetFound={(assetId, qrData) => handleScan(assetId, qrData)}
          onClose={() => setShowScanner(false)}
          autoNavigate={false}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Scan Asset QR Code</CardTitle>
            <CardDescription>Scan the QR code on the asset you want to check out</CardDescription>
          </CardHeader>
          <CardContent>
            {assetInfo ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium">Asset Scanned</p>
                <div className="text-center">
                  <p className="font-semibold">{assetInfo.name}</p>
                  <p className="text-sm text-muted-foreground">Tag: {assetInfo.assetTag}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Click the button below to scan an asset QR code
                </p>
                <Button onClick={() => setShowScanner(true)}>
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR Code
                </Button>
              </div>
            )}
          </CardContent>
          {assetInfo && (
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAssetInfo(null)
                  setScannedAssetData(null)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
              <Button onClick={() => setShowScanner(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                Scan Again
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {assetInfo && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When you will return the asset</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Why are you checking out this asset?" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>Briefly describe why you need this asset</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Check Out Asset"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
