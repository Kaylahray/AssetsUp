import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ApprovalRequest, ApprovalStatus } from "./entities/approval-request.entity"
import { CreateApprovalRequestDto } from "./dto/create-approval-request.dto"
import { UpdateApprovalRequestDto } from "./dto/update-approval-request.dto"
import { QueryApprovalRequestsDto } from "./dto/query-approval-requests.dto"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class ApprovalEngineService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private approvalRepo: Repository<ApprovalRequest>,
  ) {}

  async createApprovalRequest(dto: CreateApprovalRequestDto): Promise<ApprovalRequest> {
    const approval = this.approvalRepo.create({
      actionType: dto.actionType,
      resourceId: dto.resourceId,
      resourceType: dto.resourceType,
      requestedBy: dto.requestedBy,
      requestReason: dto.requestReason,
      status: ApprovalStatus.PENDING,
    })
    return this.approvalRepo.save(approval)
  }

  async getApprovalRequest(id: string): Promise<ApprovalRequest> {
    const approval = await this.approvalRepo.findOne({ where: { id } })
    if (!approval) {
      throw new NotFoundException("Approval request not found")
    }
    return approval
  }

  async queryApprovalRequests(query: QueryApprovalRequestsDto): Promise<PaginatedResult<ApprovalRequest>> {
    const { page = 1, limit = 10, ...filters } = query
    const skip = (page - 1) * limit

    // Build where conditions
    const whereConditions: any = {}
    if (filters.actionType) whereConditions.actionType = filters.actionType
    if (filters.resourceType) whereConditions.resourceType = filters.resourceType
    if (filters.resourceId) whereConditions.resourceId = filters.resourceId
    if (filters.status) whereConditions.status = filters.status
    if (filters.requestedBy) whereConditions.requestedBy = filters.requestedBy
    if (filters.reviewedBy) whereConditions.reviewedBy = filters.reviewedBy

    const [data, total] = await this.approvalRepo.findAndCount({
      where: whereConditions,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async updateApprovalRequest(id: string, dto: UpdateApprovalRequestDto): Promise<ApprovalRequest> {
    const approval = await this.getApprovalRequest(id)

    // Prevent updating already processed requests
    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException("Cannot update approval request that is not pending")
    }

    // Set decision date for approved/rejected requests
    const updateData: any = {
      status: dto.status,
      reviewedBy: dto.reviewedBy,
      comments: dto.comments,
    }

    if (dto.status === ApprovalStatus.APPROVED || dto.status === ApprovalStatus.REJECTED) {
      updateData.decisionDate = new Date()
    }

    await this.approvalRepo.update(id, updateData)
    return this.getApprovalRequest(id)
  }

  async cancelApprovalRequest(id: string, cancelledBy: string): Promise<ApprovalRequest> {
    const approval = await this.getApprovalRequest(id)

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException("Cannot cancel approval request that is not pending")
    }

    await this.approvalRepo.update(id, {
      status: ApprovalStatus.CANCELLED,
      reviewedBy: cancelledBy,
      decisionDate: new Date(),
      comments: "Request cancelled by user",
    })

    return this.getApprovalRequest(id)
  }

  async getApprovalRequestsByResource(resourceType: string, resourceId: string): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({
      where: { resourceType, resourceId },
      order: { createdAt: "DESC" },
    })
  }

  async getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({
      where: { status: ApprovalStatus.PENDING },
      order: { createdAt: "ASC" },
    })
  }

  async getApprovalRequestsByUser(requestedBy: string): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({
      where: { requestedBy },
      order: { createdAt: "DESC" },
    })
  }

  async getApprovalRequestsByReviewer(reviewedBy: string): Promise<ApprovalRequest[]> {
    return this.approvalRepo.find({
      where: { reviewedBy },
      order: { decisionDate: "DESC" },
    })
  }

  async getApprovalStats(): Promise<{
    total: number
    pending: number
    approved: number
    rejected: number
    cancelled: number
  }> {
    const [total, pending, approved, rejected, cancelled] = await Promise.all([
      this.approvalRepo.count(),
      this.approvalRepo.count({ where: { status: ApprovalStatus.PENDING } }),
      this.approvalRepo.count({ where: { status: ApprovalStatus.APPROVED } }),
      this.approvalRepo.count({ where: { status: ApprovalStatus.REJECTED } }),
      this.approvalRepo.count({ where: { status: ApprovalStatus.CANCELLED } }),
    ])

    return { total, pending, approved, rejected, cancelled }
  }
}
