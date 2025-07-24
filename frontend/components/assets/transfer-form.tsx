"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { Asset, User, Department, TransferType } from "@/types"
import { api } from "@/lib/api"

const formSchema = z.object({
  assetId: z.string().uuid(),
  transferType: z.enum([
    "USER_TO_USER",
    "USER_TO_DEPARTMENT",
    "DEPARTMENT_TO_USER",
    "DEPARTMENT_TO_DEPARTMENT",
    "INITIAL_ASSIGNMENT",
  ]),
  fromUserId: z.string().uuid().optional(),
  toUserId: z.string().uuid().optional(),
  fromDepartment: z.string().optional(),
  toDepartment: z.string().optional(),
  transferDate: z.date(),
  reason: z.string().min(3).max(500),
  notes: z.string().max(1000).optional(),
})

interface TransferFormProps {
  asset: Asset
  users?: User[]
  departments?: Department[]
  onSuccess?: () => void
}

export function TransferForm({ asset, users = [], departments = [], onSuccess }: TransferFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [transferType, setTransferType] = useState<TransferType | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: asset.id,
      transferType: asset.assignedTo ? "USER_TO_USER" : "INITIAL_ASSIGNMENT",
      fromUserId: asset.assignedTo?.id,
      fromDepartment: asset.department,
      transferDate: new Date(),
      reason: "",
      notes: "",
    },
  })

  // Update form fields when transfer type changes
  useEffect(() => {
    const currentType = form.watch("transferType")
    setTransferType(currentType as TransferType)
  }, [form.watch("transferType")])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await api.post("/asset-transfers", values)

      toast({
        title: "Transfer request submitted",
        description: "The asset transfer request has been submitted successfully.",
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/assets/${asset.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting transfer:", error)
      toast({
        title: "Error",
        description: "Failed to submit transfer request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="transferType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transfer Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Reset related fields when transfer type changes
                    if (value === "USER_TO_USER" || value === "DEPARTMENT_TO_USER") {
                      form.setValue("toUserId", "")
                    } else if (value === "USER_TO_DEPARTMENT" || value === "DEPARTMENT_TO_DEPARTMENT") {
                      form.setValue("toDepartment", "")
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transfer type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {asset.assignedTo && <SelectItem value="USER_TO_USER">User to User</SelectItem>}
                    {asset.assignedTo && <SelectItem value="USER_TO_DEPARTMENT">User to Department</SelectItem>}
                    {!asset.assignedTo && <SelectItem value="DEPARTMENT_TO_USER">Department to User</SelectItem>}
                    {!asset.assignedTo && (
                      <SelectItem value="DEPARTMENT_TO_DEPARTMENT">Department to Department</SelectItem>
                    )}
                    {!asset.assignedTo && <SelectItem value="INITIAL_ASSIGNMENT">Initial Assignment</SelectItem>}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transferDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transfer Date</FormLabel>
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
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* From User/Department fields */}
        {(transferType === "USER_TO_USER" || transferType === "USER_TO_DEPARTMENT") && (
          <FormField
            control={form.control}
            name="fromUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From User</FormLabel>
                <FormControl>
                  <Input value={asset.assignedTo?.name || ""} disabled />
                </FormControl>
                <FormDescription>Current user assigned to this asset</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(transferType === "DEPARTMENT_TO_USER" || transferType === "DEPARTMENT_TO_DEPARTMENT") && (
          <FormField
            control={form.control}
            name="fromDepartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Department</FormLabel>
                <FormControl>
                  <Input value={asset.department || ""} disabled />
                </FormControl>
                <FormDescription>Current department assigned to this asset</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* To User/Department fields */}
        {(transferType === "USER_TO_USER" ||
          transferType === "DEPARTMENT_TO_USER" ||
          transferType === "INITIAL_ASSIGNMENT") && (
          <FormField
            control={form.control}
            name="toUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To User</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>User to assign this asset to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(transferType === "USER_TO_DEPARTMENT" || transferType === "DEPARTMENT_TO_DEPARTMENT") && (
          <FormField
            control={form.control}
            name="toDepartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Department</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Department to assign this asset to</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Transfer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why this asset is being transferred"
                  className="resize-none"
                  {...field}
                />
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
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any additional notes or instructions" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Transfer Request"
          )}
        </Button>
      </form>
    </Form>
  )
}
