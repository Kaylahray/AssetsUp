"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckCircle, UserCheck, ArrowRight, ExternalLink, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  date: string
  type: "transfer" | "assignment" | "return"
  fromUser?: string
  toUser?: string
  fromDepartment?: string
  toDepartment?: string
  status: string
  onChainId?: string
  source: "database" | "blockchain"
  notes?: string
}

interface AssignmentHistoryTimelineProps {
  history: HistoryItem[]
  assetId: string
}

export function AssignmentHistoryTimeline({ history, assetId }: AssignmentHistoryTimelineProps) {
  const [expanded, setExpanded] = useState(false)

  // Show only the last 3 items unless expanded
  const displayHistory = expanded ? history : history.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="space-y-6">
        {displayHistory.map((item, index) => (
          <div key={item.id || index} className="flex">
            <div className="mr-4 flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border",
                  item.source === "blockchain" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200",
                )}
              >
                {item.type === "transfer" && (
                  <ArrowRight
                    className={cn("h-5 w-5", item.source === "blockchain" ? "text-green-500" : "text-blue-500")}
                  />
                )}
                {item.type === "assignment" && (
                  <UserCheck
                    className={cn("h-5 w-5", item.source === "blockchain" ? "text-green-500" : "text-blue-500")}
                  />
                )}
                {item.type === "return" && (
                  <CheckCircle
                    className={cn("h-5 w-5", item.source === "blockchain" ? "text-green-500" : "text-blue-500")}
                  />
                )}
              </div>
              {index < displayHistory.length - 1 && <div className="h-full w-px bg-border" />}
            </div>
            <div className="flex flex-col space-y-1.5 pb-6">
              <div className="flex items-center">
                <p className="text-sm font-medium leading-none">{format(new Date(item.date), "MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground ml-2">{format(new Date(item.date), "h:mm a")}</p>
                {item.source === "blockchain" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="ml-2">
                          <Shield className="h-4 w-4 text-green-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Verified on blockchain</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="rounded-md border p-3 mt-2">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                      {item.type === "transfer" && "Asset Transfer"}
                      {item.type === "assignment" && "Asset Assignment"}
                      {item.type === "return" && "Asset Return"}
                    </h4>
                    <Badge
                      variant={
                        item.status === "completed" || item.status === "COMPLETED"
                          ? "default"
                          : item.status === "pending" || item.status === "PENDING"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    {item.fromUser && item.toUser && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{item.fromUser}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{item.toUser}</span>
                      </div>
                    )}

                    {item.fromDepartment && item.toDepartment && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{item.fromDepartment}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{item.toDepartment}</span>
                      </div>
                    )}

                    {item.fromUser && item.toDepartment && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{item.fromUser}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{item.toDepartment}</span>
                      </div>
                    )}

                    {item.fromDepartment && item.toUser && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{item.fromDepartment}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>{item.toUser}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && <p className="text-xs text-muted-foreground mt-1.5">{item.notes}</p>}

                  {item.onChainId && (
                    <div className="mt-2 flex items-center">
                      <p className="text-xs text-muted-foreground">Transaction: {item.onChainId.substring(0, 8)}...</p>
                      <a
                        href={`https://testnet.starkscan.co/tx/${item.onChainId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 inline-flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 text-blue-500" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {history.length > 3 && (
        <Button variant="outline" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show Less" : `Show ${history.length - 3} More`}
        </Button>
      )}
    </div>
  )
}
