import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// This would be a server component in a real app
async function getUserAssets(userId: string) {
  // In a real app, this would fetch from your API
  return {
    user: {
      id: userId,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "Employee",
      department: "Engineering",
    },
    assets: [
      {
        id: "1",
        name: "MacBook Pro",
        assetTag: "LT-2023-001",
        serialNumber: "C02ZW1ZXLVDL",
        status: "active",
        assignmentId: "assign-001",
        assignmentType: "permanent",
        assignmentDate: "2023-01-15T00:00:00.000Z",
      },
      {
        id: "2",
        name: "iPhone 13",
        assetTag: "PH-2023-042",
        serialNumber: "DNQPX1A2LLVM",
        status: "active",
        assignmentId: "assign-002",
        assignmentType: "temporary",
        assignmentDate: "2023-02-10T00:00:00.000Z",
        dueDate: "2023-08-10T00:00:00.000Z",
      },
    ],
    history: [
      {
        id: "hist-001",
        assetId: "3",
        assetName: "Dell Monitor",
        assetTag: "MN-2022-015",
        action: "returned",
        date: "2022-12-01T00:00:00.000Z",
      },
      {
        id: "hist-002",
        assetId: "4",
        assetName: "Logitech MX Master",
        assetTag: "MS-2022-008",
        action: "returned",
        date: "2022-11-15T00:00:00.000Z",
      },
    ],
  }
}

export default function UserAssetsPage({ params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    notFound()
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
            <BreadcrumbLink href="/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/users/${id}`}>User Profile</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Assigned Assets</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Assets</h1>
        <Button asChild>
          <Link href={`/assets/batch-assign?assigneeType=user&assigneeId=${id}`}>
            <Plus className="mr-2 h-4 w-4" /> Assign Assets
          </Link>
        </Button>
      </div>

      <Suspense fallback={<UserAssetsSkeleton />}>
        <UserAssetsContent userId={id} />
      </Suspense>
    </div>
  )
}

function UserAssetsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

async function UserAssetsContent({ userId }: { userId: string }) {
  const data = await getUserAssets(userId)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Details about the user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>
                {data.user.firstName} {data.user.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{data.user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p>{data.user.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department</p>
              <p>{data.user.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Current Assets</TabsTrigger>
          <TabsTrigger value="history">Assignment History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {data.assets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40 p-6">
                <p className="text-muted-foreground mb-4">No assets currently assigned to this user</p>
                <Button asChild>
                  <Link href={`/assets/batch-assign?assigneeType=user&assigneeId=${userId}`}>
                    <Plus className="mr-2 h-4 w-4" /> Assign Assets
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.assets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <CardDescription>{asset.assetTag || asset.serialNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm font-medium">{asset.assignmentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assigned:</span>
                        <span className="text-sm font-medium">
                          {new Date(asset.assignmentDate).toLocaleDateString()}
                        </span>
                      </div>
                      {asset.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Due:</span>
                          <span className="text-sm font-medium">{new Date(asset.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <div className="bg-muted p-2">
                    <Button variant="ghost" size="sm" className="w-full justify-between" asChild>
                      <Link href={`/assets/${asset.id}`}>
                        View Details
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Assignment History</CardTitle>
              <CardDescription>Previously assigned assets</CardDescription>
            </CardHeader>
            <CardContent>
              {data.history.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <p>No assignment history found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.history.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link href={`/assets/${item.assetId}`} className="font-medium hover:underline">
                            {item.assetName}
                          </Link>
                          <span className="text-sm text-muted-foreground">({item.assetTag})</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <span className="capitalize">{item.action}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/assets/${item.assetId}`}>View Asset</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
