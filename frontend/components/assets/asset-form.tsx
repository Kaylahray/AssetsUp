"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Loader2, Upload, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { assetApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { branchApi } from "@/lib/api"

// Asset form schema
const assetFormSchema = z.object({
  name: z.string().min(1, "Asset name is required").max(100),
  type: z.string().min(1, "Asset type is required").max(50),
  serialNumber: z.string().min(1, "Serial number is required").max(50),
  category: z.string().min(1, "Category is required").max(50),
  condition: z.enum(["new", "good", "fair", "poor"]),
  location: z.string().min(1, "Location is required").max(100),
  department: z.string().min(1, "Department is required").max(50),
  purchaseDate: z.date({
    required_error: "Purchase date is required",
  }),
  purchasePrice: z.coerce.number().min(0, "Price must be a positive number").max(1000000, "Price is too high"),
  warrantyExpiration: z.date().optional(),
  status: z.enum(["available", "assigned", "maintenance", "retired"]).default("available"),
  notes: z.string().max(1000).optional(),
  assetTag: z.string().max(50).optional(),
  branchId: z.string().optional(),
})

type AssetFormValues = z.infer<typeof assetFormSchema>

type AssetFormProps = {
  assetId?: string
  onSuccess?: () => void
}

export function AssetForm({ assetId, onSuccess }: AssetFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [documents, setDocuments] = useState<string[]>([])
  const [departments, setDepartments] = useState([
    "Engineering",
    "Marketing",
    "Sales",
    "Finance",
    "HR",
    "Operations",
    "IT",
    "Customer Support",
    "Research",
    "Executive",
  ])
  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Office Equipment",
    "Vehicles",
    "Tools",
    "Software",
    "Machinery",
    "IT Infrastructure",
    "Communication Devices",
    "Lab Equipment",
  ])
  const [branches, setBranches] = useState([])

  // Initialize form
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      type: "",
      serialNumber: "",
      category: "",
      condition: "new",
      location: "",
      department: "",
      status: "available",
      notes: "",
      assetTag: "",
      branchId: "",
    },
  })

  useEffect(() => {
    // Fetch branches
    branchApi
      .getAll()
      .then((response) => {
        // Filter active branches
        const activeBranches = response.data.filter((branch) => branch.isActive)
        setBranches(activeBranches)
      })
      .catch((error) => {
        console.error("Error loading branches:", error)
      })
  }, [])

  // Load asset data if editing
  useEffect(() => {
    if (assetId) {
      setIsLoading(true)
      assetApi
        .getById(assetId)
        .then((response) => {
          const asset = response.data

          // Format dates for the form
          const formattedAsset = {
            ...asset,
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
            warrantyExpiration: asset.warrantyExpiration ? new Date(asset.warrantyExpiration) : undefined,
          }

          form.reset(formattedAsset)

          if (asset.images) setImages(asset.images)
          if (asset.documents) setDocuments(asset.documents)
        })
        .catch((error) => {
          console.error("Error loading asset:", error)
          toast({
            title: "Error",
            description: "Failed to load asset data. Please try again.",
            variant: "destructive",
          })
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [assetId, form])

  // Handle form submission
  const onSubmit = async (data: AssetFormValues) => {
    setIsLoading(true)

    try {
      // Add images and documents to the data
      const assetData = {
        ...data,
        images,
        documents,
      }

      let response

      if (assetId) {
        // Update existing asset
        response = await assetApi.update(assetId, assetData)
        toast({
          title: "Asset Updated",
          description: "The asset has been updated successfully.",
        })
      } else {
        // Create new asset
        response = await assetApi.create(assetData)
        toast({
          title: "Asset Created",
          description: "The asset has been created successfully.",
        })

        // Reset form after successful creation
        form.reset()
        setImages([])
        setDocuments([])
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/assets/${response.data.id}`)
      }
    } catch (error) {
      console.error("Error saving asset:", error)
      toast({
        title: "Error",
        description: "Failed to save asset. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file uploads
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "image" | "document") => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }

    try {
      const response = await assetApi.uploadFiles(formData)
      const fileUrls = response.data.urls

      if (type === "image") {
        setImages((prev) => [...prev, ...fileUrls])
      } else {
        setDocuments((prev) => [...prev, ...fileUrls])
      }

      toast({
        title: "Files Uploaded",
        description: `${fileUrls.length} files uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading files:", error)
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Clear the input
      event.target.value = ""
    }
  }

  // Remove a file
  const removeFile = (url: string, type: "image" | "document") => {
    if (type === "image") {
      setImages((prev) => prev.filter((image) => image !== url))
    } else {
      setDocuments((prev) => prev.filter((doc) => doc !== url))
    }
  }

  // Get file name from URL
  const getFileName = (url: string) => {
    return url.split("/").pop() || url
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="MacBook Pro 16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Type*</FormLabel>
                        <FormControl>
                          <Input placeholder="Laptop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="C02E839AJGH7" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assetTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Tag</FormLabel>
                      <FormControl>
                        <Input placeholder="ASSET-2023-0001" {...field} />
                      </FormControl>
                      <FormDescription>Leave blank to auto-generate</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location & Assignment */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Location & Assignment</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="Headquarters - Floor 3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Financial Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date*</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price*</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="warrantyExpiration"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Warranty Expiration</FormLabel>
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
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information about the asset"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files & Attachments */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Files & Attachments</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Images */}
              <div>
                <h4 className="text-sm font-medium mb-2">Images</h4>
                <div className="border rounded-md p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Asset image ${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(image, "image")}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center gap-2 cursor-pointer p-2 border border-dashed rounded-md w-full hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Images</span>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "image")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium mb-2">Documents</h4>
                <div className="border rounded-md p-4">
                  <div className="space-y-2 mb-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-md group">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[200px]">{getFileName(doc)}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(doc, "document")}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center">
                    <label
                      htmlFor="document-upload"
                      className="flex items-center justify-center gap-2 cursor-pointer p-2 border border-dashed rounded-md w-full hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Documents</span>
                      <input
                        id="document-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "document")}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading || isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {assetId ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
