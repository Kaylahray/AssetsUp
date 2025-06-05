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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import type { Asset, User, Department } from "@/types"
import { api } from "@/lib/api"

const formSchema = z.object({
  assigneeType: z.enum(["user", "department"]),
  assigneeId: z.string().min(1, "Please select an assignee"),
  assignmentType: z.enum(["permanent", "temporary"]),
  dueDate: z.date().optional().nullable(),
  notes: z.string().max(500).optional(),
  recordOnBlockchain: z.boolean().default(true),
  notifyAssignee: z.boolean().default(true),
})

export default function AssignAssetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [asset, setAsset] = useState<Asset | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assigneeType: "user",
      assigneeId: "",
      assignmentType: "permanent",
      dueDate: null,
      notes: "",
      recordOnBlockchain: true,
      notifyAssignee: true,
    },
  })

  const assigneeType = form.watch("assigneeType")
  const assignmentType = form.watch("assignmentType")

  useEffect(() => {
    fetchData()
  }, [params.id])

  async function fetchData() {
    setIsLoadingData(true)
    try {
      const [assetResponse, usersResponse, departmentsResponse] = await Promise.all([
        api.get(`/assets/${params.id}`),
        api.get("/users"),
        api.get("/departments"),
      ])

      setAsset(assetResponse.data)
      setUsers(usersResponse.data)
      setDepartments(departmentsResponse.data)

      // If asset is already assigned, redirect to asset page
      if (assetResponse.data.assignedTo) {
        toast({
          title: "Asset already assigned",
          description: "This asset is already assigned to someone. Please unassign it first.",
          variant: "destructive",
        })
        router.push(`/assets/${params.id}`)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
      router.push("/assets")
    } finally {
      setIsLoadingData(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (assignmentType === "temporary" && !values.dueDate) {
      toast({
        title: "Due date required",
        description: "Please select a due date for temporary assignments.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await api.post(`/assets/${params.id}/assign`, values)

      toast({
        title: "Success",
        description: "Asset has been assigned successfully.",
      })

      router.push(`/assets/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error assigning asset:", error)
      toast({
        title: "Error",
        description: "Failed to assign asset. Please try again.",
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
          <h1 className="text-xl font-semibold ml-2">Assign Asset</h1>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold ml-2">Asset Not Found</h1>
        </div>
        <p className="text-center text-muted-foreground">The requested asset could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold ml-2">Assign Asset</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign {asset.name}</CardTitle>
          <CardDescription>
            Asset Tag: {asset.assetTag || "N/A"} | Serial Number: {asset.serialNumber || "N/A"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assigneeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="department">Department</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select whether to assign to a user or department</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{assigneeType === "user" ? "User" : "Department"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${assigneeType}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assigneeType === "user"
                            ? users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))
                            : departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the {assigneeType} to assign this asset to</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="permanent">Permanent</SelectItem>
                          <SelectItem value="temporary">Temporary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Permanent assignments have no end date, temporary ones do</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {assignmentType === "temporary" && (
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
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>The date when the asset should be returned</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any notes about this assignment" className="resize-none" {...field} />
                    </FormControl>
                    <FormDescription>Optional notes about the assignment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notifyAssignee"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Notify Assignee</FormLabel>
                        <FormDescription>
                          Send an email notification to the assignee about this assignment
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordOnBlockchain"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Record on Blockchain</FormLabel>
                        <FormDescription>Create an immutable record of this assignment on StarkNet</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
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
              "Assign Asset"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
