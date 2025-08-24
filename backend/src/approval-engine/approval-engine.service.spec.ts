import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { ApprovalEngineService } from "./approval-engine.service"
import { ApprovalRequest, ApprovalActionType, ApprovalStatus } from "./entities/approval-request.entity"
import { BadRequestException, NotFoundException } from "@nestjs/common"

describe("ApprovalEngineService", () => {
  let service: ApprovalEngineService
  let repo: Repository<ApprovalRequest>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ApprovalEngineService,
        {
          provide: getRepositoryToken(ApprovalRequest),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile()

    service = moduleRef.get(ApprovalEngineService)
    repo = moduleRef.get(getRepositoryToken(ApprovalRequest))
  })

  describe("createApprovalRequest", () => {
    it("should create a new approval request", async () => {
      const dto = {
        actionType: ApprovalActionType.DISPOSAL,
        resourceId: "ASSET-123",
        resourceType: "asset",
        requestedBy: "user@example.com",
        requestReason: "End of life disposal",
      }

      const expectedApproval = {
        id: "uuid-1",
        ...dto,
        status: ApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(repo.create as any).mockReturnValue(expectedApproval)
      ;(repo.save as any).mockResolvedValue(expectedApproval)

      const result = await service.createApprovalRequest(dto)

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        status: ApprovalStatus.PENDING,
      })
      expect(repo.save).toHaveBeenCalledWith(expectedApproval)
      expect(result).toEqual(expectedApproval)
    })
  })

  describe("getApprovalRequest", () => {
    it("should return approval request if found", async () => {
      const approval = {
        id: "uuid-1",
        actionType: ApprovalActionType.DISPOSAL,
        resourceId: "ASSET-123",
        resourceType: "asset",
        requestedBy: "user@example.com",
        status: ApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(repo.findOne as any).mockResolvedValue(approval)

      const result = await service.getApprovalRequest("uuid-1")

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: "uuid-1" } })
      expect(result).toEqual(approval)
    })

    it("should throw NotFoundException if approval request not found", async () => {
      ;(repo.findOne as any).mockResolvedValue(null)

      await expect(service.getApprovalRequest("uuid-1")).rejects.toThrow(NotFoundException)
    })
  })

  describe("queryApprovalRequests", () => {
    it("should return paginated results with filters", async () => {
      const query = {
        page: 1,
        limit: 10,
        actionType: ApprovalActionType.DISPOSAL,
        status: ApprovalStatus.PENDING,
      }

      const approvals = [
        {
          id: "uuid-1",
          actionType: ApprovalActionType.DISPOSAL,
          status: ApprovalStatus.PENDING,
        },
      ]

      ;(repo.findAndCount as any).mockResolvedValue([approvals, 1])

      const result = await service.queryApprovalRequests(query)

      expect(repo.findAndCount).toHaveBeenCalledWith({
        where: {
          actionType: ApprovalActionType.DISPOSAL,
          status: ApprovalStatus.PENDING,
        },
        order: { createdAt: "DESC" },
        skip: 0,
        take: 10,
      })
      expect(result).toEqual({
        data: approvals,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })
  })

  describe("updateApprovalRequest", () => {
    it("should update pending approval request", async () => {
      const approval = {
        id: "uuid-1",
        status: ApprovalStatus.PENDING,
      }

      const updateDto = {
        status: ApprovalStatus.APPROVED,
        reviewedBy: "reviewer@example.com",
        comments: "Approved after review",
      }

      const updatedApproval = {
        ...approval,
        ...updateDto,
        decisionDate: new Date(),
      }

      ;(repo.findOne as any).mockResolvedValue(approval)
      ;(repo.update as any).mockResolvedValue({ affected: 1 })
      ;(repo.findOne as any).mockResolvedValue(updatedApproval)

      const result = await service.updateApprovalRequest("uuid-1", updateDto)

      expect(repo.update).toHaveBeenCalledWith("uuid-1", {
        ...updateDto,
        decisionDate: expect.any(Date),
      })
      expect(result).toEqual(updatedApproval)
    })

    it("should throw BadRequestException when updating non-pending request", async () => {
      const approval = {
        id: "uuid-1",
        status: ApprovalStatus.APPROVED,
      }

      const updateDto = {
        status: ApprovalStatus.REJECTED,
        reviewedBy: "reviewer@example.com",
      }

      ;(repo.findOne as any).mockResolvedValue(approval)

      await expect(service.updateApprovalRequest("uuid-1", updateDto)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe("cancelApprovalRequest", () => {
    it("should cancel pending approval request", async () => {
      const approval = {
        id: "uuid-1",
        status: ApprovalStatus.PENDING,
      }

      const cancelledApproval = {
        ...approval,
        status: ApprovalStatus.CANCELLED,
        reviewedBy: "user@example.com",
        decisionDate: new Date(),
        comments: "Request cancelled by user",
      }

      ;(repo.findOne as any).mockResolvedValue(approval)
      ;(repo.update as any).mockResolvedValue({ affected: 1 })
      ;(repo.findOne as any).mockResolvedValue(cancelledApproval)

      const result = await service.cancelApprovalRequest("uuid-1", "user@example.com")

      expect(repo.update).toHaveBeenCalledWith("uuid-1", {
        status: ApprovalStatus.CANCELLED,
        reviewedBy: "user@example.com",
        decisionDate: expect.any(Date),
        comments: "Request cancelled by user",
      })
      expect(result).toEqual(cancelledApproval)
    })

    it("should throw BadRequestException when cancelling non-pending request", async () => {
      const approval = {
        id: "uuid-1",
        status: ApprovalStatus.APPROVED,
      }

      ;(repo.findOne as any).mockResolvedValue(approval)

      await expect(service.cancelApprovalRequest("uuid-1", "user@example.com")).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe("getApprovalRequestsByResource", () => {
    it("should return approval requests for specific resource", async () => {
      const approvals = [
        {
          id: "uuid-1",
          resourceType: "asset",
          resourceId: "ASSET-123",
        },
      ]

      ;(repo.find as any).mockResolvedValue(approvals)

      const result = await service.getApprovalRequestsByResource("asset", "ASSET-123")

      expect(repo.find).toHaveBeenCalledWith({
        where: { resourceType: "asset", resourceId: "ASSET-123" },
        order: { createdAt: "DESC" },
      })
      expect(result).toEqual(approvals)
    })
  })

  describe("getPendingApprovalRequests", () => {
    it("should return all pending approval requests", async () => {
      const approvals = [
        {
          id: "uuid-1",
          status: ApprovalStatus.PENDING,
        },
      ]

      ;(repo.find as any).mockResolvedValue(approvals)

      const result = await service.getPendingApprovalRequests()

      expect(repo.find).toHaveBeenCalledWith({
        where: { status: ApprovalStatus.PENDING },
        order: { createdAt: "ASC" },
      })
      expect(result).toEqual(approvals)
    })
  })

  describe("getApprovalStats", () => {
    it("should return approval statistics", async () => {
      ;(repo.count as any)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // pending
        .mockResolvedValueOnce(5) // approved
        .mockResolvedValueOnce(1) // rejected
        .mockResolvedValueOnce(1) // cancelled

      const result = await service.getApprovalStats()

      expect(result).toEqual({
        total: 10,
        pending: 3,
        approved: 5,
        rejected: 1,
        cancelled: 1,
      })
    })
  })
})
