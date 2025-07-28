import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MobileDevicesService } from "./mobile-devices.service";
import { MobileDevice, MobileDeviceStatus, MobileDeviceType, OperatingSystem } from "./entities/mobile-device.entity";
import { CreateMobileDeviceDto } from "./dto/create-mobile-device.dto";
import { UpdateMobileDeviceDto } from "./dto/update-mobile-device.dto";
import { ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";

describe("MobileDevicesService", () => {
  let service: MobileDevicesService;
  let repository: Repository<MobileDevice>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    count: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileDevicesService,
        {
          provide: getRepositoryToken(MobileDevice),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MobileDevicesService>(MobileDevicesService);
    repository = module.get<Repository<MobileDevice>>(getRepositoryToken(MobileDevice));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new mobile device", async () => {
      const createDto: CreateMobileDeviceDto = {
        name: "iPhone 13",
        model: "iPhone 13",
        manufacturer: "Apple",
        imei: "123456789012345",
        serialNumber: "SN123456789",
        operatingSystem: OperatingSystem.IOS,
        osVersion: "15.0",
      };

      const mockDevice = {
        id: "1",
        ...createDto,
        status: MobileDeviceStatus.AVAILABLE,
        deviceType: MobileDeviceType.PHONE,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockDevice);
      mockRepository.save.mockResolvedValue(mockDevice);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDevice);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDevice);
    });

    it("should throw ConflictException if IMEI already exists", async () => {
      const createDto: CreateMobileDeviceDto = {
        name: "iPhone 13",
        model: "iPhone 13",
        manufacturer: "Apple",
        imei: "123456789012345",
        serialNumber: "SN123456789",
        operatingSystem: OperatingSystem.IOS,
        osVersion: "15.0",
      };

      mockRepository.findOne.mockResolvedValue({ id: "1", imei: "123456789012345" });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe("findOne", () => {
    it("should return a mobile device by id", async () => {
      const mockDevice = {
        id: "1",
        name: "iPhone 13",
        imei: "123456789012345",
      };

      mockRepository.findOne.mockResolvedValue(mockDevice);

      const result = await service.findOne("1");

      expect(result).toEqual(mockDevice);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["assignedUser"],
      });
    });

    it("should throw NotFoundException if device not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a mobile device", async () => {
      const updateDto: UpdateMobileDeviceDto = {
        name: "iPhone 13 Pro",
      };

      const existingDevice = {
        id: "1",
        name: "iPhone 13",
        imei: "123456789012345",
        serialNumber: "SN123456789",
      };

      const updatedDevice = {
        ...existingDevice,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingDevice);
      mockRepository.save.mockResolvedValue(updatedDevice);

      const result = await service.update("1", updateDto);

      expect(result).toEqual(updatedDevice);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDevice);
    });
  });

  describe("decommission", () => {
    it("should decommission a mobile device", async () => {
      const mockDevice = {
        id: "1",
        name: "iPhone 13",
        status: MobileDeviceStatus.AVAILABLE,
        assignedUserId: null,
      };

      const decommissionedDevice = {
        ...mockDevice,
        status: MobileDeviceStatus.DECOMMISSIONED,
        decommissionDate: new Date(),
        decommissionReason: "End of life",
        decommissionedBy: "admin",
      };

      mockRepository.findOne.mockResolvedValue(mockDevice);
      mockRepository.save.mockResolvedValue(decommissionedDevice);

      const result = await service.decommission("1", "End of life", "admin");

      expect(result.status).toBe(MobileDeviceStatus.DECOMMISSIONED);
      expect(result.decommissionReason).toBe("End of life");
      expect(result.decommissionedBy).toBe("admin");
    });

    it("should throw BadRequestException if device is already decommissioned", async () => {
      const mockDevice = {
        id: "1",
        name: "iPhone 13",
        status: MobileDeviceStatus.DECOMMISSIONED,
      };

      mockRepository.findOne.mockResolvedValue(mockDevice);

      await expect(service.decommission("1", "End of life", "admin")).rejects.toThrow(BadRequestException);
    });
  });

  describe("assignToUser", () => {
    it("should assign a device to a user", async () => {
      const mockDevice = {
        id: "1",
        name: "iPhone 13",
        status: MobileDeviceStatus.AVAILABLE,
        assignedUserId: null,
      };

      const assignedDevice = {
        ...mockDevice,
        assignedUserId: "user1",
        assignedDate: new Date(),
        status: MobileDeviceStatus.ASSIGNED,
        assignmentNotes: "Assigned for work",
      };

      mockRepository.findOne.mockResolvedValue(mockDevice);
      mockRepository.save.mockResolvedValue(assignedDevice);

      const result = await service.assignToUser("1", "user1", "Assigned for work");

      expect(result.assignedUserId).toBe("user1");
      expect(result.status).toBe(MobileDeviceStatus.ASSIGNED);
      expect(result.assignmentNotes).toBe("Assigned for work");
    });
  });

  describe("getStatistics", () => {
    it("should return device statistics", async () => {
      mockRepository.count.mockResolvedValueOnce(100); // total
      mockRepository.count.mockResolvedValueOnce(50); // available
      mockRepository.count.mockResolvedValueOnce(30); // assigned
      mockRepository.count.mockResolvedValueOnce(10); // maintenance
      mockRepository.count.mockResolvedValueOnce(10); // decommissioned
      mockRepository.count.mockResolvedValueOnce(5); // needing os update
      mockRepository.count.mockResolvedValueOnce(3); // expiring warranty

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalDevices: 100,
        availableDevices: 50,
        assignedDevices: 30,
        maintenanceDevices: 10,
        decommissionedDevices: 10,
        devicesNeedingOsUpdate: 5,
        devicesWithExpiringWarranty: 3,
      });
    });
  });
}); 