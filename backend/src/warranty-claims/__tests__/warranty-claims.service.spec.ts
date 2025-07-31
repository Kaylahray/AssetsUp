import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WarrantyClaimsService } from '../warranty-claims.service';
import { WarrantyClaim } from '../entities/warranty-claim.entity';
import { WarrantyClaimStatus } from '../enums/warranty-claim-status.enum';
import { CreateWarrantyClaimDto } from '../dto/create-warranty-claim.dto';
import { UpdateWarrantyClaimDto } from '../dto/update-warranty-claim.dto';

describe('WarrantyClaimsService', () => {
  let service: WarrantyClaimsService;
  let repository: Repository<WarrantyClaim>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarrantyClaimsService,
        {
          provide: getRepositoryToken(WarrantyClaim),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WarrantyClaimsService>(WarrantyClaimsService);
    repository = module.get<Repository<WarrantyClaim>>(getRepositoryToken(WarrantyClaim));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a warranty claim successfully', async () => {
      const createDto: CreateWarrantyClaimDto = {
        assetId: '123e4567-e89b-12d3-a456-426614174001',
        warrantyId: '123e4567-e89b-12d3-a456-426614174002',
        description: 'Test warranty claim',
      };

      mockRepository.create.mockReturnValue(mockWarrantyClaim);
      mockRepository.save.mockResolvedValue(mockWarrantyClaim);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: WarrantyClaimStatus.SUBMITTED,
        claimDate: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockWarrantyClaim);
      expect(result).toEqual(mockWarrantyClaim);
    });

    it('should throw BadRequestException when creation fails', async () => {
      const createDto: CreateWarrantyClaimDto = {
        assetId: '123e4567-e89b-12d3-a456-426614174001',
        warrantyId: '123e4567-e89b-12d3-a456-426614174002',
        description: 'Test warranty claim',
      };

      mockRepository.create.mockReturnValue(mockWarrantyClaim);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated warranty claims', async () => {
      const queryDto = { page: 1, limit: 10 };
      const expectedResult = [mockWarrantyClaim];
      const totalCount = 1;

      mockRepository.findAndCount.mockResolvedValue([expectedResult, totalCount]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: expectedResult,
        total: totalCount,
        page: 1,
        limit: 10,
      });
    });

    it('should apply filters correctly', async () => {
      const queryDto = {
        status: WarrantyClaimStatus.SUBMITTED,
        vendorId: '123e4567-e89b-12d3-a456-426614174003',
        page: 1,
        limit: 10,
      };

      mockRepository.findAndCount.mockResolvedValue([[mockWarrantyClaim], 1]);

      await service.findAll(queryDto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
        where: {
          status: WarrantyClaimStatus.SUBMITTED,
          vendorId: '123e4567-e89b-12d3-a456-426614174003',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a warranty claim by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockWarrantyClaim);

      const result = await service.findOne(mockWarrantyClaim.claimId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { claimId: mockWarrantyClaim.claimId },
      });
      expect(result).toEqual(mockWarrantyClaim);
    });

    it('should throw NotFoundException when claim not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a warranty claim successfully', async () => {
      const updateDto: UpdateWarrantyClaimDto = {
        description: 'Updated description',
      };

      mockRepository.findOne.mockResolvedValue(mockWarrantyClaim);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockWarrantyClaim)
        .mockResolvedValueOnce({ ...mockWarrantyClaim, ...updateDto });

      const result = await service.update(mockWarrantyClaim.claimId, updateDto);

      expect(mockRepository.update).toHaveBeenCalledWith(mockWarrantyClaim.claimId, updateDto);
      expect(result.description).toBe(updateDto.description);
    });

    it('should validate status transitions', async () => {
      const updateDto: UpdateWarrantyClaimDto = {
        status: WarrantyClaimStatus.RESOLVED,
      };

      mockRepository.findOne.mockResolvedValue(mockWarrantyClaim);

      await expect(
        service.update(mockWarrantyClaim.claimId, updateDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      const mockClaimInReview = {
        ...mockWarrantyClaim,
        status: WarrantyClaimStatus.IN_REVIEW,
      };

      mockRepository.findOne.mockResolvedValue(mockClaimInReview);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockClaimInReview)
        .mockResolvedValueOnce({
          ...mockClaimInReview,
          status: WarrantyClaimStatus.APPROVED,
        });

      const result = await service.updateStatus(
        mockWarrantyClaim.claimId,
        WarrantyClaimStatus.APPROVED,
        'Claim approved'
      );

      expect(result.status).toBe(WarrantyClaimStatus.APPROVED);
    });

    it('should reject invalid status transitions', async () => {
      mockRepository.findOne.mockResolvedValue(mockWarrantyClaim);

      await expect(
        service.updateStatus(mockWarrantyClaim.claimId, WarrantyClaimStatus.RESOLVED)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Status transition validation', () => {
    const testCases = [
      {
        from: WarrantyClaimStatus.SUBMITTED,
        to: WarrantyClaimStatus.IN_REVIEW,
        shouldSucceed: true,
      },
      {
        from: WarrantyClaimStatus.SUBMITTED,
        to: WarrantyClaimStatus.REJECTED,
        shouldSucceed: true,
      },
      {
        from: WarrantyClaimStatus.SUBMITTED,
        to: WarrantyClaimStatus.APPROVED,
        shouldSucceed: false,
      },
      {
        from: WarrantyClaimStatus.IN_REVIEW,
        to: WarrantyClaimStatus.APPROVED,
        shouldSucceed: true,
      },
      {
        from: WarrantyClaimStatus.IN_REVIEW,
        to: WarrantyClaimStatus.REJECTED,
        shouldSucceed: true,
      },
      {
        from: WarrantyClaimStatus.APPROVED,
        to: WarrantyClaimStatus.RESOLVED,
        shouldSucceed: true,
      },
      {
        from: WarrantyClaimStatus.REJECTED,
        to: WarrantyClaimStatus.APPROVED,
        shouldSucceed: false,
      },
      {
        from: WarrantyClaimStatus.RESOLVED,
        to: WarrantyClaimStatus.IN_REVIEW,
        shouldSucceed: false,
      },
    ];

    testCases.forEach(({ from, to, shouldSucceed }) => {
      it(`should ${shouldSucceed ? 'allow' : 'reject'} transition from ${from} to ${to}`, async () => {
        const mockClaim = { ...mockWarrantyClaim, status: from };
        mockRepository.findOne.mockResolvedValue(mockClaim);

        if (shouldSucceed) {
          mockRepository.update.mockResolvedValue({ affected: 1 });
          mockRepository.findOne.mockResolvedValueOnce(mockClaim)
            .mockResolvedValueOnce({ ...mockClaim, status: to });

          const result = await service.updateStatus(mockWarrantyClaim.claimId, to);
          expect(result.status).toBe(to);
        } else {
          await expect(
            service.updateStatus(mockWarrantyClaim.claimId, to)
          ).rejects.toThrow(BadRequestException);
        }
      });
    });
  });

  describe('addSupportingDocuments', () => {
    it('should add supporting documents to existing claim', async () => {
      const documentPaths = ['path/to/doc1.pdf', 'path/to/doc2.jpg'];
      const existingDocs = ['existing/doc.pdf'];
      const mockClaimWithDocs = {
        ...mockWarrantyClaim,
        supportingDocs: existingDocs,
      };

      mockRepository.findOne.mockResolvedValue(mockClaimWithDocs);
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(mockClaimWithDocs)
        .mockResolvedValueOnce({
          ...mockClaimWithDocs,
          supportingDocs: [...existingDocs, ...documentPaths],
        });

      const result = await service.addSupportingDocuments(mockWarrantyClaim.claimId, documentPaths);

      expect(result.supportingDocs).toEqual([...existingDocs, ...documentPaths]);
    });
  });

  describe('getClaimStatistics', () => {
    it('should return claim statistics by status', async () => {
      const mockStats = [
        { status: WarrantyClaimStatus.SUBMITTED, count: '5' },
        { status: WarrantyClaimStatus.IN_REVIEW, count: '3' },
        { status: WarrantyClaimStatus.APPROVED, count: '2' },
        { status: WarrantyClaimStatus.REJECTED, count: '1' },
        { status: WarrantyClaimStatus.RESOLVED, count: '4' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getClaimStatistics();

      expect(result).toEqual({
        [WarrantyClaimStatus.SUBMITTED]: 5,
        [WarrantyClaimStatus.IN_REVIEW]: 3,
        [WarrantyClaimStatus.APPROVED]: 2,
        [WarrantyClaimStatus.REJECTED]: 1,
        [WarrantyClaimStatus.RESOLVED]: 4,
      });
    });
  });
});