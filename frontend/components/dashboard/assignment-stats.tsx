"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Briefcase, Clock, CheckCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface AssignmentStats {
  totalAssets: number
  assignedAssets: number
  availableAssets: number
  overdueAssets: number
  assignmentRate: number
  userAssignments: number
  departmentAssignments: number
  temporaryAssignments: number
  permanentAssignments: number
}

export function AssignmentStats() {
  const router = useRouter()
  const [stats, setStats] = useState<AssignmentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAssignmentStats()
  }, [])

  async function fetchAssignmentStats() {
    setIsLoading(true)
    try {
      const response = await api.get("/assets/stats/assignments")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching assignment stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch assignment statistics.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Assignment</CardTitle>
          <CardDescription>Loading assignment statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Assignment</CardTitle>
          <CardDescription>No assignment data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-gray-500">Unable to load assignment statistics</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Assignment</CardTitle>
        <CardDescription>Overview of asset assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Assignment Rate</span>
            <span className="text-sm font-medium">{stats.assignmentRate}%</span>
          </div>
          <Progress value={stats.assignmentRate} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">User Assignments</span>
            </div>
            <div className="text-2xl font-bold">{stats.userAssignments}</div>
          </div>
          <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">Department</span>
            </div>
            <div className="text-2xl font-bold">{stats.departmentAssignments}</div>
          </div>
          <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Temporary</span>
            </div>
            <div className="text-2xl font-bold">{stats.temporaryAssignments}</div>
          </div>
          <div className="flex flex-col space-y-1.5 rounded-lg border p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Permanent</span>
            </div>
            <div className="text-2xl font-bold">{stats.permanentAssignments}</div>
          </div>
        </div>

        {stats.overdueAssets > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 border border-amber-200">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-sm font-medium text-amber-800">{stats.overdueAssets} overdue assets</div>
                <div className="text-xs text-amber-600">Assets past their return date</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-200 hover:bg-amber-100 hover:text-amber-900"
              onClick={() => router.push("/assets/overdue")}
            >
              View
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => router.push("/assets/batch-assign")}>
          Batch Assign Assets
        </Button>
      </CardFooter>
    </Card>
  )
}
