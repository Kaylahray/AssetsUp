"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Users, User, Check } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Asset, User as UserType, Department } from "@/types"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const formSchema = z.object({
  assigneeType: z.enum(["user", "department"]),
  assigneeId: z.string(),
  assignmentType: z.enum(["permanent", "temporary"]),
  startDate: z.date(),
  endDate: z.date().optional(),
  notes: z.string().optional(),
  notifyAssignee: z.boolean().default(true),
  assetIds: z.array(z.string()).min(1, "Select at least one asset"),
})

export default function BatchAssignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<UserType[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Get assigneeType and assigneeId from URL if available
  const assigneeTypeParam = searchParams.get("assigneeType")
  const assigneeIdParam = searchParams.get("assigneeId")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assigneeType: assigneeTypeParam === "user" || assigneeTypeParam === "department" ? assigneeTypeParam : "user",
      assigneeId: assigneeIdParam || "",
      assignmentType: "permanent",
      startDate: new Date(),
      notifyAssignee: true,
      notes: "",
      assetIds: [],
    },
  })

  const assigneeType = form.watch("assigneeType")
  const assignmentType = form.watch("assignmentType")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, departmentsResponse, assetsResponse] = await Promise.all([
          api.get("/users"),
          api.get("/departments"),
          api.get("/assets?status=available"),
        ])
        setUsers(usersResponse.data)
        setDepartments(departmentsResponse.data)
        setAssets(assetsResponse.data)
        setFilteredAssets(assetsResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    // Update form values when URL params change
    if (assigneeTypeParam && (assigneeTypeParam === "user" || assigneeTypeParam === "department")) {
      form.setValue("assigneeType", assigneeTypeParam)
    }

    if (assigneeIdParam) {
      form.setValue("assigneeId", assigneeIdParam)
    }
  }, [assigneeTypeParam, assigneeIdParam, form])

  useEffect(() => {
    // Filter assets based on search term
    if (searchTerm.trim() === "") {
      setFilteredAssets(assets)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredAssets(
        assets.filter(
          (asset) =>
            asset.name.toLowerCase().includes(term) ||
            (asset.assetTag && asset.assetTag.toLowerCase().includes(term)) ||
            asset.serialNumber.toLowerCase().includes(term),
        ),
      )
    }
  }, [searchTerm, assets])

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) => {
      if (prev.includes(assetId)) {
        return prev.filter((id) => id !== assetId)
      } else {
        return [...prev, assetId]
      }
    })
  }

  useEffect(() => {
    form.setValue("assetIds", selectedAssets)
  }, [selectedAssets, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const payload = {
        ...values,
        endDate: values.assignmentType === "temporary" ? values.endDate : null,
      }

      const response = await api.post("/assets/batch-assignments", payload)

      toast({
        title: "Success",
        description: `${selectedAssets.length} assets assigned successfully`,
      })

      if (assigneeType === "user") {
        router.push(`/users/${values.assigneeId}/assets`)
      } else {
        router.push(`/departments/${values.assigneeId}/assets`)
      }

      router.refresh()
    } catch (error) {
      console.error("Error assigning assets:", error)
      toast({
        title: "Error",
        description: "Failed to assign assets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/assets">Assets</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Batch Assign</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold">Batch Assign Assets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>Specify who to assign the assets to and the assignment terms</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="assigneeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignee type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                <span>User</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="department">
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Department</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))
                              : departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {assignmentType === "temporary" && (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
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
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < form.getValues("startDate")}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about this assignment"
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
                    name="notifyAssignee"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Notify Assignee</FormLabel>
                          <FormDescription>Send an email notification about this assignment</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assetIds"
                    render={() => (
                      <FormItem>
                        <FormLabel>Selected Assets ({selectedAssets.length})</FormLabel>
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
              <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading || selectedAssets.length === 0}>
                {isLoading ? "Assigning..." : `Assign ${selectedAssets.length} Assets`}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Assets</CardTitle>
              <CardDescription>Choose the assets you want to assign</CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Search assets by name, tag, or serial number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssets.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                    <p>No available assets found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className={cn(
                          "flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-colors",
                          selectedAssets.includes(asset.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                        )}
                        onClick={() => toggleAssetSelection(asset.id)}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full border",
                            selectedAssets.includes(asset.id)
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground",
                          )}
                        >
                          {selectedAssets.includes(asset.id) && <Check className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{asset.name}</p>
                            <Badge variant="outline">{asset.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{asset.assetTag || asset.serialNumber}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>Location: {asset.location || "Not specified"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="text-sm text-muted-foreground">{selectedAssets.length} assets selected</div>
              <Button variant="ghost" onClick={() => setSelectedAssets([])} disabled={selectedAssets.length === 0}>
                Clear Selection
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
