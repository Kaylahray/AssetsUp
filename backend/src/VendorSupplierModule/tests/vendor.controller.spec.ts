import { Test, TestingModule } from "@nestjs/testing";
import { VendorController } from "../vendor.controller";
import { VendorService } from "../vendor.service";
import { VendorType, VendorStatus } from "../vendor.enums";

describe("VendorController", () => {
  let controller: VendorController;
  let service: VendorService;

  const mockVendorService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockVendor = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Vendor",
    type: VendorType.COMPANY,
    phoneNumber: "+1234567890",
    email: "test@vendor.com",
    taxId: "TX123456789",
    status: VendorStatus.ACTIVE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorController],
      providers: [
        {
          provide: VendorService,
          useValue: mockVendorService,
        },
      ],
    }).compile();

    controller = module.get<VendorController>(VendorController);
    service = module.get<VendorService>(VendorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a vendor", async () => {
      const createDto = {
        name: "Test Vendor",
        type: VendorType.COMPANY,
        phoneNumber: "+1234567890",
        email: "test@vendor.com",
        taxId: "TX123456789",
      };

      mockVendorService.create.mockResolvedValue(mockVendor);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockVendor);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("findAll", () => {
    it("should return all vendors with pagination", async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = {
        vendors: [mockVendor],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockVendorService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("findOne", () => {
    it("should return a vendor by id", async () => {
      mockVendorService.findOne.mockResolvedValue(mockVendor);

      const result = await controller.findOne(mockVendor.id);

      expect(result).toEqual(mockVendor);
      expect(service.findOne).toHaveBeenCalledWith(mockVendor.id);
    });
  });

  describe("update", () => {
    it("should update a vendor", async () => {
      const updateDto = { name: "Updated Vendor" };
      const updatedVendor = { ...mockVendor, ...updateDto };

      mockVendorService.update.mockResolvedValue(updatedVendor);

      const result = await controller.update(mockVendor.id, updateDto);

      expect(result).toEqual(updatedVendor);
      expect(service.update).toHaveBeenCalledWith(mockVendor.id, updateDto);
    });
  });

  describe("remove", () => {
    it("should remove a vendor", async () => {
      mockVendorService.remove.mockResolvedValue(undefined);

      await controller.remove(mockVendor.id);

      expect(service.remove).toHaveBeenCalledWith(mockVendor.id);
    });
  });

  describe("updateStatus", () => {
    it("should update vendor status", async () => {
      const updatedVendor = { ...mockVendor, status: VendorStatus.INACTIVE };

      mockVendorService.updateStatus.mockResolvedValue(updatedVendor);

      const result = await controller.updateStatus(
        mockVendor.id,
        VendorStatus.INACTIVE
      );

      expect(result).toEqual(updatedVendor);
      expect(service.updateStatus).toHaveBeenCalledWith(
        mockVendor.id,
        VendorStatus.INACTIVE
      );
    });
  });
});
