import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { MaintenanceService } from "./maintenance.service"
import { Maintenance, MaintenanceStatus, MaintenanceType } from "./entities/maintenance.entity"
import { NotificationService } from "../notifications/notification.service"

describe("MaintenanceService", () => {
  let service: MaintenanceService
  let repository: Repository<Maintenance>
  let notificationService: NotificationService

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getCount: jest.fn(),
      clone: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    })),
  }

  const mockNotificationService = {
    sendUpcomingMaintenanceNotification: jest.fn(),
    sendMaintenanceOverdueNotification: jest.fn(),
    scheduleMaintenanceNotification: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaintenanceService,
        {
          provide: getRepositoryToken(Maintenance),
          useValue: mockRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile()

    service = module.get<MaintenanceService>(MaintenanceService)
    repository = module.get<Repository<Maintenance>>(getRepositoryToken(Maintenance))
    notificationService = module.get<NotificationService>(NotificationService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a maintenance record", async () => {
      const createDto = {
        type: MaintenanceType.PREVENTIVE,
        description: "Test maintenance",
        startDate: "2024-01-01",
        dueDate: "2024-01-05",
        assetId: "asset-id",
      }

      const mockMaintenance = {
        id: "maintenance-id",
        ...createDto,
        status: MaintenanceStatus.SCHEDULED,
      }

      mockRepository.create.mockReturnValue(mockMaintenance)
      mockRepository.save.mockResolvedValue(mockMaintenance)
      jest.spyOn(service, "findOne").mockResolvedValue(mockMaintenance as any)

      const result = await service.create(createDto)

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        startDate: new Date(createDto.startDate),
        dueDate: new Date(createDto.dueDate),
      })
      expect(mockRepository.save).toHaveBeenCalledWith(mockMaintenance)
      expect(result).toEqual(mockMaintenance)
    })

    it("should throw error if due date is before start date", async () => {
      const createDto = {
        type: MaintenanceType.PREVENTIVE,
        description: "Test maintenance",
        startDate: "2024-01-05",
        dueDate: "2024-01-01",
        assetId: "asset-id",
      }

      await expect(service.create(createDto)).rejects.toThrow("Due date must be after start date")
    })
  })

  describe("markAsCompleted", () => {
    it("should mark maintenance as completed", async () => {
      const maintenanceId = "maintenance-id"
      const actualHours = 5
      const mockMaintenance = {
        id: maintenanceId,
        status: MaintenanceStatus.COMPLETED,
      }

      jest.spyOn(service, "findOne").mockResolvedValue(mockMaintenance as any)

      const result = await service.markAsCompleted(maintenanceId, actualHours)

      expect(mockRepository.update).toHaveBeenCalledWith(maintenanceId, {
        status: MaintenanceStatus.COMPLETED,
        completionDate: expect.any(Date),
        actualHours,
      })
      expect(result).toEqual(mockMaintenance)
    })
  })
})
