import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { VendorService } from "../vendor.service";
import { Vendor } from "../vendor.entity";
import { VendorType, VendorStatus } from "../vendor.enums";

describe("VendorService", () => {
  let service: VendorService;
  let repository: Repository<Vendor>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockVendor: Vendor = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Vendor",
    type: VendorType.COMPANY,
    contactPerson: "John Doe",
    phoneNumber: "+1234567890",
    email: "test@vendor.com",
    taxId: "TX123456789",
    address: "123 Main St",
    status: VendorStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorService,
        {
          provide: getRepositoryToken(Vendor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VendorService>(VendorService);
    repository = module.get<Repository<Vendor>>(getRepositoryToken(Vendor));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a vendor successfully", async () => {
      const createVendorDto = {
        name: "Test Vendor",
        type: VendorType.COMPANY,
        phoneNumber: "+1234567890",
        email: "test@vendor.com",
        taxId: "TX123456789",
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockVendor);
      mockRepository.save.mockResolvedValue(mockVendor);

      const result = await service.create(createVendorDto);

      expect(result).toEqual(mockVendor);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { taxId: createVendorDto.taxId },
      });
    });

    it("should throw ConflictException if tax ID already exists", async () => {
      const createVendorDto = {
        name: "Test Vendor",
        type: VendorType.COMPANY,
        phoneNumber: "+1234567890",
        email: "test@vendor.com",
        taxId: "TX123456789",
      };

      mockRepository.findOne.mockResolvedValue(mockVendor);

      await expect(service.create(createVendorDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return filtered vendors", async () => {
      const query = { type: VendorType.COMPANY, status: VendorStatus.ACTIVE };
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockVendor], 1]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(query);

      expect(result).toEqual({
        vendors: [mockVendor],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe("findOne", () => {
    it("should return a vendor by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockVendor);

      const result = await service.findOne(mockVendor.id);

      expect(result).toEqual(mockVendor);
    });

    it("should throw NotFoundException if vendor not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("nonexistent-id")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("should update a vendor successfully", async () => {
      const updateDto = { name: "Updated Vendor" };
      const updatedVendor = { ...mockVendor, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockVendor);
      mockRepository.save.mockResolvedValue(updatedVendor);

      const result = await service.update(mockVendor.id, updateDto);

      expect(result).toEqual(updatedVendor);
    });
  });

  describe("remove", () => {
    it("should remove a vendor successfully", async () => {
      mockRepository.findOne.mockResolvedValue(mockVendor);
      mockRepository.remove.mockResolvedValue(mockVendor);

      await service.remove(mockVendor.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockVendor);
    });
  });
});
