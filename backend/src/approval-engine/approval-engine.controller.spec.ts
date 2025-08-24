import { Test } from "@nestjs/testing"
import { ApprovalEngineController } from "./approval-engine.controller"
import { ApprovalEngineService } from "./approval-engine.service"
import { ApprovalActionType, ApprovalStatus } from "./entities/approval-request.entity"

describe("ApprovalEngineController", () => {
  let controller: ApprovalEngineController
  let service: ApprovalEngineService

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ApprovalEngineController],
      providers: [
        {
          provide: ApprovalEngineService,
          useValue: {
            createApprovalRequest: jest.fn(),
            getApprovalRequest: jest.fn(),
            queryApprovalRequests: jest.fn(),
            updateApprovalRequest: jest.fn(),
            cancelApprovalRequest: jest.fn(),
            getApprovalRequestsByResource: jest.fn(),
            getPendingApprovalRequests: jest.fn(),
            getApprovalRequestsByUser: jest.fn(),
            getApprovalRequestsByReviewer: jest.fn(),
            getApprovalStats: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = moduleRef.get(ApprovalEngineController)
    service = moduleRef.get(ApprovalEngineService)
  })

  describe("createApprovalRequest", () => {
    it("should create approval request", async () => {
      const dto = {
        actionType: ApprovalActionType.DISPOSAL,
        resourceId: "ASSET-123",
        resourceType: "asset",
        requestedBy: "user@example.com",
        requestReason: "End of life disposal",
      }

      const expectedResult = {
        id: "uuid-1",
        ...dto,
        status: ApprovalStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      ;(service.createApprovalRequest as any).mockResolvedValue(expectedResult)

      const result = await controller.createApprovalRequest(dto)

      expect(service.createApprovalRequest).toHaveBeenCalledWith(dto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("queryApprovalRequests", () => {
    it("should query approval requests with filters", async () => {
      const query = {
        page: 1,
        limit: 10,
        actionType: ApprovalActionType.DISPOSAL,
        status: ApprovalStatus.PENDING,
      }

      const expectedResult = {
        data: [
          {
            id: "uuid-1",
            actionType: ApprovalActionType.DISPOSAL,
            status: ApprovalStatus.PENDING,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      ;(service.queryApprovalRequests as any).mockResolvedValue(expectedResult)

      const result = await controller.queryApprovalRequests(query)

      expect(service.queryApprovalRequests).toHaveBeenCalledWith(query)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getApprovalRequest", () => {
    it("should get approval request by ID", async () => {
      const expectedResult = {
        id: "uuid-1",
        actionType: ApprovalActionType.DISPOSAL,
        status: ApprovalStatus.PENDING,
      }

      ;(service.getApprovalRequest as any).mockResolvedValue(expectedResult)

      const result = await controller.getApprovalRequest("uuid-1")

      expect(service.getApprovalRequest).toHaveBeenCalledWith("uuid-1")
      expect(result).toEqual(expectedResult)
    })
  })

  describe("updateApprovalRequest", () => {
    it("should update approval request", async () => {
      const updateDto = {
        status: ApprovalStatus.APPROVED,
        reviewedBy: "reviewer@example.com",
        comments: "Approved after review",
      }

      const expectedResult = {
        id: "uuid-1",
        ...updateDto,
        decisionDate: new Date(),
      }

      ;(service.updateApprovalRequest as any).mockResolvedValue(expectedResult)

      const result = await controller.updateApprovalRequest("uuid-1", updateDto)

      expect(service.updateApprovalRequest).toHaveBeenCalledWith("uuid-1", updateDto)
      expect(result).toEqual(expectedResult)
    })
  })

  describe("cancelApprovalRequest", () => {
    it("should cancel approval request", async () => {
      const expectedResult = {
        id: "uuid-1",
        status: ApprovalStatus.CANCELLED,
        reviewedBy: "user@example.com",
        decisionDate: new Date(),
        comments: "Request cancelled by user",
      }

      ;(service.cancelApprovalRequest as any).mockResolvedValue(expectedResult)

      const result = await controller.cancelApprovalRequest("uuid-1", "user@example.com")

      expect(service.cancelApprovalRequest).toHaveBeenCalledWith("uuid-1", "user@example.com")
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getApprovalRequestsByResource", () => {
    it("should get approval requests by resource", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          resourceType: "asset",
          resourceId: "ASSET-123",
        },
      ]

      ;(service.getApprovalRequestsByResource as any).mockResolvedValue(expectedResult)

      const result = await controller.getApprovalRequestsByResource("asset", "ASSET-123")

      expect(service.getApprovalRequestsByResource).toHaveBeenCalledWith("asset", "ASSET-123")
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getPendingApprovalRequests", () => {
    it("should get pending approval requests", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          status: ApprovalStatus.PENDING,
        },
      ]

      ;(service.getPendingApprovalRequests as any).mockResolvedValue(expectedResult)

      const result = await controller.getPendingApprovalRequests()

      expect(service.getPendingApprovalRequests).toHaveBeenCalled()
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getApprovalRequestsByUser", () => {
    it("should get approval requests by user", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          requestedBy: "user@example.com",
        },
      ]

      ;(service.getApprovalRequestsByUser as any).mockResolvedValue(expectedResult)

      const result = await controller.getApprovalRequestsByUser("user@example.com")

      expect(service.getApprovalRequestsByUser).toHaveBeenCalledWith("user@example.com")
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getApprovalRequestsByReviewer", () => {
    it("should get approval requests by reviewer", async () => {
      const expectedResult = [
        {
          id: "uuid-1",
          reviewedBy: "reviewer@example.com",
        },
      ]

      ;(service.getApprovalRequestsByReviewer as any).mockResolvedValue(expectedResult)

      const result = await controller.getApprovalRequestsByReviewer("reviewer@example.com")

      expect(service.getApprovalRequestsByReviewer).toHaveBeenCalledWith("reviewer@example.com")
      expect(result).toEqual(expectedResult)
    })
  })

  describe("getApprovalStats", () => {
    it("should get approval statistics", async () => {
      const expectedResult = {
        total: 10,
        pending: 3,
        approved: 5,
        rejected: 1,
        cancelled: 1,
      }

      ;(service.getApprovalStats as any).mockResolvedValue(expectedResult)

      const result = await controller.getApprovalStats()

      expect(service.getApprovalStats).toHaveBeenCalled()
      expect(result).toEqual(expectedResult)
    })
  })
})
