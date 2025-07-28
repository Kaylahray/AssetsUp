import { Test, TestingModule } from '@nestjs/testing';
import { WarrantyClaimsController } from '../warranty-claims.controller';
import { WarrantyClaimsService } from '../warranty-claims.service';
import { CreateWarrantyClaimDto } from '../dto/create-warranty-claim.dto';
import { UpdateWarrantyClaimDto } from '../dto/update-warranty-claim.dto';
import { WarrantyClaimQueryDto } from '../dto/warranty-claim-query.dto';
import { WarrantyClaimStatus } from '../enums/warranty-claim-status.enum';
import { WarrantyClaim } from '../entities/warranty-claim.entity';

describe('WarrantyClaimsController', () => {
  let controller: WarrantyClaimsController;
  let service: WarrantyClaimsService;

  const mockWarrantyClaim: WarrantyClaim = {
    claimId: '123e4567-e89b-12d3-a456-426614174000',
    assetId: '123e4567-e89b-12d3-a456-426614174001',
    warrantyId: '123e4567-e89b-12d3-a456-426614174002',
    description: 'Test warranty claim',
    claimDate: new Date(),
    status: WarrantyClaimStatus.SUBMITTED,
    supportingDocs: [],
    resolutionNotes: null,
    vendorId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateStatus: jest.fn(),
    addSupportingDocuments: jest.fn(),
    getClaimsByStatus: jest.fn(),
    getClaimStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarrantyClaimsController],
      providers: [
        {
          provide: WarrantyClaimsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WarrantyClaimsController>(WarrantyClaimsController);
    service = module.get<WarrantyClaimsService>(WarrantyClaimsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a warranty claim', async () => {
      const createDto: CreateWarrantyClaimDto = {
        assetId: '123e4567-e89b-12d3-a456-426614174001',
        warrantyId: '123e4567-e89b-12d3-a456-426614174002',
        description: 'Test warranty claim',
      };

      mockService.create.mockResolvedValue(mockWarrantyClaim);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWarrantyClaim);
    });
  });

  describe('findAll', () => {
    it('should return paginated warranty claims', async () => {
      const queryDto: WarrantyClaimQueryDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [mockWarrantyClaim],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a warranty claim by ID', async () => {
      mockService.findOne.mockResolvedValue(mockWarrantyClaim);

      const result = await controller.findOne(mockWarrantyClaim.claimId);

      expect(service.findOne).toHaveBeenCalledWith(mockWarrantyClaim.claimId);
      expect(result).toEqual(mockWarrantyClaim);
    });
  });

  describe('update', () => {
    it('should update a warranty claim', async () => {
      const updateDto: UpdateWarrantyClaimDto = {
        description: 'Updated description',
      };

      const updatedClaim = { ...mockWarrantyClaim, ...updateDto };
      mockService.update.mockResolvedValue(updatedClaim);

      const result = await controller.update(mockWarrantyClaim.claimId, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockWarrantyClaim.claimId, updateDto);
      expect(result).toEqual(updatedClaim);
    });
  });

  describe('remove', () => {
    it('should delete a warranty claim', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(mockWarrantyClaim.claimId);

      expect(service.remove).toHaveBeenCalledWith(mockWarrantyClaim.claimId);
    });
  });

  describe('updateStatus', () => {
    it('should update warranty claim status', async () => {
      const statusUpdate = {
        status: WarrantyClaimStatus.IN_REVIEW,
        resolutionNotes: 'Under review',
      };

      const updatedClaim = { ...mockWarrantyClaim, ...statusUpdate };
      mockService.updateStatus.mockResolvedValue(updatedClaim);

      const result = await controller.updateStatus(mockWarrantyClaim.claimId, statusUpdate);

      expect(service.updateStatus).toHaveBeenCalledWith(
        mockWarrantyClaim.claimId,
        statusUpdate.status,
        statusUpdate.resolutionNotes
      );
      expect(result).toEqual(updatedClaim);
    });
  });

  describe('uploadDocuments', () => {
    it('should upload supporting documents', async () => {
      const mockFiles = [
        { path: 'uploads/file1.pdf' },
        { path: 'uploads/file2.jpg' },
      ] as Express.Multer.File[];

      const updatedClaim = {
        ...mockWarrantyClaim,
        supportingDocs: ['uploads/file1.pdf', 'uploads/file2.jpg'],
      };

      mockService.addSupportingDocuments.mockResolvedValue(updatedClaim);

      const result = await controller.uploadDocuments(mockWarrantyClaim.claimId, mockFiles);

      expect(service.addSupportingDocuments).toHaveBeenCalledWith(
        mockWarrantyClaim.claimId,
        ['uploads/file1.pdf', 'uploads/file2.jpg']
      );
      expect(result).toEqual(updatedClaim);
    });
  });

  describe('getClaimsByStatus', () => {
    it('should return claims by status', async () => {
      const status = WarrantyClaimStatus.SUBMITTED;
      const claims = [mockWarrantyClaim];

      mockService.getClaimsByStatus.mockResolvedValue(claims);

      const result = await controller.getClaimsByStatus(status);

      expect(service.getClaimsByStatus).toHaveBeenCalledWith(status);
      expect(result).toEqual(claims);
    });
  });

  describe('getStatistics', () => {
    it('should return warranty claim statistics', async () => {
      const stats = {
        [WarrantyClaimStatus.SUBMITTED]: 5,
        [WarrantyClaimStatus.IN_REVIEW]: 3,
        [WarrantyClaimStatus.APPROVED]: 2,
        [WarrantyClaimStatus.REJECTED]: 1,
        [WarrantyClaimStatus.RESOLVED]: 4,
      };

      mockService.getClaimStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(service.getClaimStatistics).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });
})