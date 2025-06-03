"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { AssetAssignment } from "@/types"
import { api } from "@/lib/api"

const formSchema = z.object({
  returnDate: z.date(),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  notes: z.string().max(1000).optional(),
  recordOnBlockchain: z.boolean().default(true),
})

export default function ReturnAssetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [assignment, setAssignment] = useState<AssetAssignment | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returnDate: new Date(),
      condition: "GOOD",
      notes: "",
      recordOnBlockchain: true,
    },
  })

  useEffect(() => {
    fetchAssignment()
  }, [params.id])

  async function fetchAssignment() {
    setIsLoadingData(true)
    try {
      const response = await api.get(`/asset-assignments/${params.id}`)
      setAssignment(response.data)

      // If assignment is already returned, redirect to asset page
      if (response.data.status === "returned") {
        toast({
          title: "Asset already returned",
          description: "This asset has already been returned.",
        })
        router.push(`/assets/${response.data.assetId}`)
      }
    } catch (error) {
      console.error("Error fetching assignment:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment data. Please try again.",
        variant: "destructive",
      })
      router.push("/assets")
    } finally {
      setIsLoadingData(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await api.post(`/asset-assignments/${params.id}/return`, values)

      toast({
        title: "Success",
        description: "Asset has been returned successfully.",
      })

      router.push(`/assets/${assignment?.assetId}`)
      router.refresh()
    } catch (error) {
      console.error("Error returning asset:", error)
      toast({
        title: "Error",
        description: "Failed to return asset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Return Asset</h1>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Assignment Not Found</h1>
        </div>
        <p className="text-center text-muted-foreground">The requested assignment could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Return Asset</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return {assignment.asset.name}</CardTitle>
          <CardDescription>
            Currently assigned to {assignment.assigneeName} since{" "}
            {format(new Date(assignment.startDate), "MMMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Asset Tag</p>
                <p className="text-sm text-muted-foreground">{assignment.asset.assetTag || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Serial Number</p>
                <p className="text-sm text-muted-foreground">{assignment.asset.serialNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Assignment Type</p>
                <p className="text-sm text-muted-foreground capitalize">{assignment.assignmentType}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground capitalize">{assignment.status}</p>
              </div>
              {assignment.dueDate && (
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(assignment.dueDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Return Date</FormLabel>
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
                          disabled={(date) => date > new Date() || date < new Date(assignment.startDate)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>The date when the asset was returned</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Asset Condition</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="EXCELLENT" />
                          </FormControl>
                          <FormLabel className="font-normal">Excellent - Like new condition</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="GOOD" />
                          </FormControl>
                          <FormLabel className="font-normal">Good - Minor wear and tear</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="FAIR" />
                          </FormControl>
                          <FormLabel className="font-normal">Fair - Noticeable wear but functional</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="POOR" />
                          </FormControl>
                          <FormLabel className="font-normal">Poor - Significant wear and tear</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="DAMAGED" />
                          </FormControl>
                          <FormLabel className="font-normal">Damaged - Requires repair</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes about the condition or return process"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any damage, missing accessories, or other relevant information
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Return Asset"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
