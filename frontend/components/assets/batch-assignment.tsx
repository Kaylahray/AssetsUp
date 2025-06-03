"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, X, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  selectedAssets: z.array(z.string()).min(1, "Please select at least one asset"),
})

export function BatchAssignment() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
      selectedAssets: [],
    },
  })

  const assigneeType = form.watch("assigneeType")
  const assignmentType = form.watch("assignmentType")

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    form.setValue("selectedAssets", selectedAssets)
  }, [selectedAssets, form])

  async function fetchData() {
    setIsLoadingData(true)
    try {
      const [assetsResponse, usersResponse, departmentsResponse] = await Promise.all([
        api.get("/assets?status=unassigned"),
        api.get("/users"),
        api.get("/departments"),
      ])

      setAssets(assetsResponse.data)
      setAvailableAssets(assetsResponse.data)
      setUsers(usersResponse.data)
      setDepartments(departmentsResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  function handleAssetSelect(assetId: string) {
    setSelectedAssets((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((id) => id !== assetId)
      } else {
        return [...prev, assetId]
      }
    })
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query) {
      const filtered = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.assetTag?.toLowerCase().includes(query) ||
          asset.serialNumber?.toLowerCase().includes(query),
      )
      setAvailableAssets(filtered)
    } else {
      setAvailableAssets(assets)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.selectedAssets.length === 0) {
      toast({
        title: "No assets selected",
        description: "Please select at least one asset to assign.",
        variant: "destructive",
      })
      return
    }

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
      await api.post("/assets/batch-assign", {
        ...values,
        selectedAssets: values.selectedAssets,
      })

      toast({
        title: "Success",
        description: `${values.selectedAssets.length} assets have been assigned successfully.`,
      })

      router.push("/assets")
      router.refresh()
    } catch (error) {
      console.error("Error assigning assets:", error)
      toast({
        title: "Error",
        description: "Failed to assign assets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Asset Assignment</CardTitle>
          <CardDescription>Assign multiple assets to a user or department at once</CardDescription>
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
                      <FormDescription>Select the {assigneeType} to assign these assets to</FormDescription>
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
                        <FormDescription>The date when the assets should be returned</FormDescription>
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

              <FormField
                control={form.control}
                name="selectedAssets"
                render={() => (
                  <FormItem>
                    <FormLabel>Select Assets</FormLabel>
                    <FormDescription>
                      Select the assets you want to assign. {selectedAssets.length} assets selected.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Assets</CardTitle>
          <CardDescription>Select assets to include in this batch assignment</CardDescription>
          <div className="mt-2">
            <Input
              placeholder="Search assets by name, tag, or serial number..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableAssets.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No assets available</AlertTitle>
              <AlertDescription>
                {searchQuery
                  ? "No assets match your search criteria."
                  : "There are no unassigned assets available for assignment."}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssets(availableAssets.map((asset) => asset.id))}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedAssets([])}>
                  <X className="mr-2 h-4 w-4" />
                  Clear Selection
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 transition-colors",
                      selectedAssets.includes(asset.id) && "border-primary bg-primary/5",
                    )}
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{asset.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {asset.assetTag && <Badge variant="outline">{asset.assetTag}</Badge>}
                        {asset.category && <Badge variant="secondary">{asset.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {asset.serialNumber && `S/N: ${asset.serialNumber}`}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => handleAssetSelect(asset.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || selectedAssets.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Assign {selectedAssets.length} Assets
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
