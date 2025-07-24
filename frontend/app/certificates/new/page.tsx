"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import type { Asset, User } from "@/types"
import { certificateApi, assetApi, userApi } from "@/lib/api"
import { ArrowLeft, Plus, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function IssueCertificatePage() {
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }])

  const [formData, setFormData] = useState({
    assetId: "",
    issuedToId: "",
    issueDate: new Date(),
    assetValue: "",
    currency: "USD",
    metadata: {
      name: "",
      description: "",
      imageUrl: "",
      attributes: {},
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [assetsResponse, usersResponse] = await Promise.all([
        assetApi.getAll({ status: "AVAILABLE" }),
        userApi.getAll(),
      ])
      setAssets(assetsResponse.data)
      setUsers(usersResponse.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast({
        title: "Error",
        description: "Failed to load assets and users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("metadata.")) {
      const metadataField = name.split(".")[1]
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          [metadataField]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({
        ...formData,
        issueDate: date,
      })
    }
  }

  const handleAttributeChange = (index: number, field: "key" | "value", value: string) => {
    const newAttributes = [...attributes]
    newAttributes[index][field] = value
    setAttributes(newAttributes)
  }

  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }])
  }

  const removeAttribute = (index: number) => {
    const newAttributes = [...attributes]
    newAttributes.splice(index, 1)
    setAttributes(newAttributes)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Convert attributes array to object
      const attributesObject = attributes.reduce(
        (acc, { key, value }) => {
          if (key && value) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, string>,
      )

      // Format the data for the API
      const certificateData = {
        ...formData,
        assetValue: Number.parseFloat(formData.assetValue),
        metadata: {
          ...formData.metadata,
          attributes: attributesObject,
        },
      }

      await certificateApi.issueCertificate(certificateData)
      toast({
        title: "Certificate Issued",
        description: "The certificate has been successfully issued.",
      })
      router.push("/certificates")
    } catch (error) {
      console.error("Failed to issue certificate:", error)
      toast({
        title: "Error",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center">
        <Button variant="outline" className="mr-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Issue New Certificate</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>
            Issue a new certificate for an asset. This will create an on-chain record of the certificate.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assetId">Asset</Label>
                <Select
                  value={formData.assetId}
                  onValueChange={(value) => handleSelectChange("assetId", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetTag || asset.serialNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuedToId">Issue To</Label>
                <Select
                  value={formData.issuedToId}
                  onValueChange={(value) => handleSelectChange("issuedToId", value)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <DatePicker date={formData.issueDate} setDate={handleDateChange} disabled={loading} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetValue">Asset Value</Label>
                  <Input
                    id="assetValue"
                    name="assetValue"
                    type="number"
                    step="0.01"
                    value={formData.assetValue}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleSelectChange("currency", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata.name">Certificate Name</Label>
              <Input
                id="metadata.name"
                name="metadata.name"
                value={formData.metadata.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata.description">Description</Label>
              <Textarea
                id="metadata.description"
                name="metadata.description"
                value={formData.metadata.description}
                onChange={handleChange}
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata.imageUrl">Image URL</Label>
              <Input
                id="metadata.imageUrl"
                name="metadata.imageUrl"
                value={formData.metadata.imageUrl}
                onChange={handleChange}
                disabled={loading}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Certificate Attributes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Attribute
                </Button>
              </div>

              {attributes.map((attr, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`attr-key-${index}`} className="sr-only">
                      Attribute Key
                    </Label>
                    <Input
                      id={`attr-key-${index}`}
                      value={attr.key}
                      onChange={(e) => handleAttributeChange(index, "key", e.target.value)}
                      placeholder="Key"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`attr-value-${index}`} className="sr-only">
                      Attribute Value
                    </Label>
                    <Input
                      id={`attr-value-${index}`}
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                      placeholder="Value"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(index)}
                    disabled={loading || attributes.length === 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || submitting}>
              {submitting ? "Issuing Certificate..." : "Issue Certificate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
