"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowUpDown, Clock, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import type { AssetAssignment } from "@/types"
import { api } from "@/lib/api"

interface OverdueAssetsProps {
  initialAssignments?: AssetAssignment[]
}

export function OverdueAssets({ initialAssignments = [] }: OverdueAssetsProps) {
  const router = useRouter()
  const [assignments, setAssignments] = useState<AssetAssignment[]>(initialAssignments)
  const [isLoading, setIsLoading] = useState(!initialAssignments.length)
  const [sortField, setSortField] = useState<string>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    if (!initialAssignments.length) {
      fetchOverdueAssets()
    }
  }, [initialAssignments])

  async function fetchOverdueAssets() {
    setIsLoading(true)
    try {
      const response = await api.get("/asset-assignments/overdue")
      setAssignments(response.data)
    } catch (error) {
      console.error("Error fetching overdue assets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch overdue assets.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function sortAssignments(field: string) {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc"
    setSortField(field)
    setSortDirection(newDirection)

    const sorted = [...assignments].sort((a, b) => {
      let valueA, valueB

      if (field === "dueDate") {
        valueA = new Date(a.dueDate).getTime()
        valueB = new Date(b.dueDate).getTime()
      } else if (field === "daysPastDue") {
        const today = new Date().getTime()
        valueA = today - new Date(a.dueDate).getTime()
        valueB = today - new Date(b.dueDate).getTime()
      } else if (field === "assetName") {
        valueA = a.asset.name.toLowerCase()
        valueB = b.asset.name.toLowerCase()
      } else if (field === "userName") {
        valueA = a.user.name.toLowerCase()
        valueB = b.user.name.toLowerCase()
      }

      if (newDirection === "asc") {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

    setAssignments(sorted)
  }

  function getDaysPastDue(dueDate: string) {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function getSeverity(days: number) {
    if (days <= 3) return "low"
    if (days <= 7) return "medium"
    return "high"
  }

  async function handleSendReminder(assignmentId: string, userId: string) {
    try {
      await api.post(`/asset-assignments/${assignmentId}/remind`)
      toast({
        title: "Reminder sent",
        description: "A reminder has been sent to the user.",
      })
    } catch (error) {
      console.error("Error sending reminder:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-amber-500" />
          Overdue Assets
        </CardTitle>
        <CardDescription>Assets that are past their due date for return</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium">No overdue assets</h3>
            <p className="text-sm text-gray-500 mt-1">All assets have been returned on time</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortAssignments("assetName")}
                      className="flex items-center p-0 h-auto font-medium"
                    >
                      Asset
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortAssignments("userName")}
                      className="flex items-center p-0 h-auto font-medium"
                    >
                      Assigned To
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortAssignments("dueDate")}
                      className="flex items-center p-0 h-auto font-medium"
                    >
                      Due Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortAssignments("daysPastDue")}
                      className="flex items-center p-0 h-auto font-medium"
                    >
                      Days Overdue
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const daysPastDue = getDaysPastDue(assignment.dueDate)
                  const severity = getSeverity(daysPastDue)

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.asset.name}
                        <div className="text-xs text-gray-500">{assignment.asset.assetTag}</div>
                      </TableCell>
                      <TableCell>{assignment.user.name}</TableCell>
                      <TableCell>{format(new Date(assignment.dueDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{daysPastDue} days</TableCell>
                      <TableCell>
                        <Badge
                          variant={severity === "low" ? "outline" : severity === "medium" ? "secondary" : "destructive"}
                        >
                          {severity === "low" ? "Low" : severity === "medium" ? "Medium" : "High"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/assets/${assignment.asset.id}`)}>
                              View Asset
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/assets/assignments/${assignment.id}/return`)}
                            >
                              Process Return
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendReminder(assignment.id, assignment.user.id)}>
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
