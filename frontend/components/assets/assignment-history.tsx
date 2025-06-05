"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar, Clock, User, Building, ArrowRight, MoreHorizontal } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import type { AssetAssignment } from "@/types"

interface AssignmentHistoryProps {
  assetId: string
  limit?: number
  showTitle?: boolean
}

export function AssignmentHistory({ assetId, limit, showTitle = true }: AssignmentHistoryProps) {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/assets/${assetId}/assignments`)
        let data = response.data

        // Apply limit if specified
        if (limit && data.length > limit) {
          data = data.slice(0, limit)
        }

        setAssignments(data)
        setError(null)
      } catch (err) {
        console.error("Error fetching assignment history:", err)
        setError("Failed to load assignment history")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [assetId, limit])

  const handleSendReminder = async (assignmentId: string) => {
    try {
      await api.post(`/asset-assignments/${assignmentId}/remind`)
      toast({
        title: "Reminder sent",
        description: "A reminder has been sent to the assignee.",
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          {showTitle && (
            <>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle>Assignment History</CardTitle>
            <CardDescription>History of all assignments for this asset</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            <p>No assignment history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {assignment.assigneeType === "user" ? (
                        <User className="mr-2 h-4 w-4 text-primary" />
                      ) : (
                        <Building className="mr-2 h-4 w-4 text-primary" />
                      )}
                      <span className="font-medium">
                        {assignment.assigneeType === "user" ? "Assigned to user" : "Assigned to department"}:{" "}
                        {assignment.assigneeName}
                      </span>
                    </div>
                    <Badge
                      variant={
                        assignment.status === "active"
                          ? "default"
                          : assignment.status === "returned"
                            ? "outline"
                            : assignment.status === "overdue"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>Assigned: {format(new Date(assignment.startDate), "MMM d, yyyy")}</span>
                    </div>

                    {assignment.assignmentType === "temporary" && (
                      <>
                        <ArrowRight className="h-3 w-3" />
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          <span>Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}</span>
                        </div>
                      </>
                    )}

                    {assignment.returnDate && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>Returned: {format(new Date(assignment.returnDate), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  {assignment.notes && <p className="text-sm mt-1 text-muted-foreground">{assignment.notes}</p>}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {assignment.status === "active" && (
                      <>
                        <DropdownMenuItem asChild>
                          <a href={`/assets/assignments/${assignment.id}/return`}>Process Return</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendReminder(assignment.id)}>
                          Send Reminder
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <a href={`/assets/assignments/${assignment.id}`}>View Details</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {limit && assignments.length >= limit && (
              <div className="flex justify-center pt-2">
                <Button variant="link" asChild>
                  <a href={`/assets/${assetId}/assignments`}>View All Assignment History</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
