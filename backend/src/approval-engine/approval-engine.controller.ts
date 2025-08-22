import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Delete,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import { ApprovalEngineService, PaginatedResult } from "./approval-engine.service"
import { CreateApprovalRequestDto } from "./dto/create-approval-request.dto"
import { UpdateApprovalRequestDto } from "./dto/update-approval-request.dto"
import { QueryApprovalRequestsDto } from "./dto/query-approval-requests.dto"
import { ApprovalRequest } from "./entities/approval-request.entity"

@ApiTags("approval-engine")
@Controller("approval-engine")
export class ApprovalEngineController {
  constructor(private service: ApprovalEngineService) {}

  @Post("requests")
  @ApiOperation({ summary: "Create a new approval request" })
  @ApiResponse({ status: 201, description: "Approval request created successfully" })
  createApprovalRequest(@Body() dto: CreateApprovalRequestDto): Promise<ApprovalRequest> {
    return this.service.createApprovalRequest(dto)
  }

  @Get("requests")
  @ApiOperation({ summary: "Get approval requests with filtering and pagination" })
  @ApiResponse({ status: 200, description: "Approval requests retrieved successfully" })
  queryApprovalRequests(@Query() query: QueryApprovalRequestsDto): Promise<PaginatedResult<ApprovalRequest>> {
    return this.service.queryApprovalRequests(query)
  }

  @Get("requests/:id")
  @ApiOperation({ summary: "Get a specific approval request by ID" })
  @ApiResponse({ status: 200, description: "Approval request retrieved successfully" })
  @ApiResponse({ status: 404, description: "Approval request not found" })
  getApprovalRequest(@Param("id") id: string): Promise<ApprovalRequest> {
    return this.service.getApprovalRequest(id)
  }

  @Put("requests/:id")
  @ApiOperation({ summary: "Update approval request (approve/reject)" })
  @ApiResponse({ status: 200, description: "Approval request updated successfully" })
  @ApiResponse({ status: 400, description: "Cannot update non-pending request" })
  @ApiResponse({ status: 404, description: "Approval request not found" })
  updateApprovalRequest(
    @Param("id") id: string,
    @Body() dto: UpdateApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    return this.service.updateApprovalRequest(id, dto)
  }

  @Delete("requests/:id")
  @ApiOperation({ summary: "Cancel a pending approval request" })
  @ApiResponse({ status: 200, description: "Approval request cancelled successfully" })
  @ApiResponse({ status: 400, description: "Cannot cancel non-pending request" })
  @ApiResponse({ status: 404, description: "Approval request not found" })
  cancelApprovalRequest(
    @Param("id") id: string,
    @Query("cancelledBy") cancelledBy: string,
  ): Promise<ApprovalRequest> {
    return this.service.cancelApprovalRequest(id, cancelledBy)
  }

  @Get("requests/resource/:resourceType/:resourceId")
  @ApiOperation({ summary: "Get approval requests for a specific resource" })
  @ApiResponse({ status: 200, description: "Approval requests retrieved successfully" })
  getApprovalRequestsByResource(
    @Param("resourceType") resourceType: string,
    @Param("resourceId") resourceId: string,
  ): Promise<ApprovalRequest[]> {
    return this.service.getApprovalRequestsByResource(resourceType, resourceId)
  }

  @Get("requests/pending")
  @ApiOperation({ summary: "Get all pending approval requests" })
  @ApiResponse({ status: 200, description: "Pending approval requests retrieved successfully" })
  getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    return this.service.getPendingApprovalRequests()
  }

  @Get("requests/user/:requestedBy")
  @ApiOperation({ summary: "Get approval requests by requester" })
  @ApiResponse({ status: 200, description: "Approval requests retrieved successfully" })
  getApprovalRequestsByUser(@Param("requestedBy") requestedBy: string): Promise<ApprovalRequest[]> {
    return this.service.getApprovalRequestsByUser(requestedBy)
  }

  @Get("requests/reviewer/:reviewedBy")
  @ApiOperation({ summary: "Get approval requests by reviewer" })
  @ApiResponse({ status: 200, description: "Approval requests retrieved successfully" })
  getApprovalRequestsByReviewer(@Param("reviewedBy") reviewedBy: string): Promise<ApprovalRequest[]> {
    return this.service.getApprovalRequestsByReviewer(reviewedBy)
  }

  @Get("stats")
  @ApiOperation({ summary: "Get approval statistics" })
  @ApiResponse({ status: 200, description: "Approval statistics retrieved successfully" })
  getApprovalStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    cancelled: number
  }> {
    return this.service.getApprovalStats()
  }
}
