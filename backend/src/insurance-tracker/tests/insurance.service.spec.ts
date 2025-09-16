import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InsuranceService } from '../insurance.service';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { PolicyDocument } from '../entities/policy-document.entity';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel, RenewalStatus } from '../insurance.enums';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('InsuranceService', () => {
  let service: InsuranceService;
  let insurancePolicyRepository: Repository<InsurancePolicy>;
  let policyDocumentRepository: Repository<PolicyDocument>;

  const mockInsurancePolicy: Partial<InsurancePolicy> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    policyNumber: 'POL-2024-001',
    provider: 'ABC Insurance Co.',
    assetId: 'asset-123',
    coverageStart: new Date('2024-01-01'),
    coverageEnd: new Date('2024-12-31'),
    insuredValue: 50000,
    status: InsurancePolicyStatus.ACTIVE,
    insuranceType: InsuranceType.COMPREHENSIVE,
    coverageLevel: CoverageLevel.STANDARD,
    renewalReminderDays: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPolicyDocument: Partial<PolicyDocument> = {
    id: 'doc-123',
    insurancePolicyId: '123e4567-e89b-12d3-a456-426614174000',
    fileName: 'policy-document.pdf',
    originalName: 'Insurance Policy.pdf',
    mimeType: 'application/pdf',
    fileSize: 1024000,
    filePath: '/uploads/insurance/policy-document.pdf',
    documentType: 'policy',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInsurancePolicyRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPolicyDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceService,
        {
          provide: getRepositoryToken(InsurancePolicy),
          useValue: mockInsurancePolicyRepository,
        },
        {
          provide: getRepositoryToken(PolicyDocument),
          useValue: mockPolicyDocumentRepository,
        },
      ],
    }).compile();

    service = module.get<InsuranceService>(InsuranceService);
    insurancePolicyRepository = module.get<Repository<InsurancePolicy>>(getRepositoryToken(InsurancePolicy));
    policyDocumentRepository = module.get<Repository<PolicyDocument>>(getRepositoryToken(PolicyDocument));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new insurance policy successfully', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(null); // No existing policy
      mockInsurancePolicyRepository.create.mockReturnValue(mockInsurancePolicy);
      mockInsurancePolicyRepository.save.mockResolvedValue(mockInsurancePolicy);

      const result = await service.create(createDto);

      expect(mockInsurancePolicyRepository.create).toHaveBeenCalledWith({
        ...createDto,
        coverageStart: new Date(createDto.coverageStart),
        coverageEnd: new Date(createDto.coverageEnd),
        lastRenewalDate: null,
        nextRenewalDate: null,
      });
      expect(mockInsurancePolicyRepository.save).toHaveBeenCalledWith(mockInsurancePolicy);
      expect(result).toEqual(mockInsurancePolicy);
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
        insuredValue: 50000,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when policy number already exists', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when neither assetId nor assetCategory is provided', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return insurance policy when found', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockInsurancePolicyRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['documents'],
      });
      expect(result).toEqual(mockInsurancePolicy);
    });

    it('should throw NotFoundException when insurance policy not found', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated insurance policies with summary', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockInsurancePolicy]);
      mockInsurancePolicyRepository.find.mockResolvedValue([mockInsurancePolicy]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: [mockInsurancePolicy],
        total: 1,
        page: 1,
        limit: 10,
        summary: expect.objectContaining({
          totalPolicies: 1,
          activePolicies: expect.any(Number),
          expiredPolicies: expect.any(Number),
          expiringSoon: expect.any(Number),
          totalInsuredValue: expect.any(Number),
        }),
      });
    });
  });

  describe('update', () => {
    it('should update insurance policy successfully', async () => {
      const updateDto: UpdateInsurancePolicyDto = {
        provider: 'Updated Insurance Co.',
        status: InsurancePolicyStatus.SUSPENDED,
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValueOnce(mockInsurancePolicy)
        .mockResolvedValueOnce({ ...mockInsurancePolicy, ...updateDto });
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(mockInsurancePolicyRepository.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto
      );
      expect(result).toEqual({ ...mockInsurancePolicy, ...updateDto });
    });

    it('should throw BadRequestException when updating with invalid dates', async () => {
      const updateDto: UpdateInsurancePolicyDto = {
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);

      await expect(service.update('123e4567-e89b-12d3-a456-426614174000', updateDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove insurance policy and associated documents', async () => {
      const policyWithDocuments = {
        ...mockInsurancePolicy,
        documents: [mockPolicyDocument],
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(policyWithDocuments);
      mockInsurancePolicyRepository.remove.mockResolvedValue(policyWithDocuments);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {});

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockInsurancePolicyRepository.remove).toHaveBeenCalledWith(policyWithDocuments);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(mockPolicyDocument.filePath);
    });
  });

  describe('findByAsset', () => {
    it('should return insurance policies for a specific asset', async () => {
      mockInsurancePolicyRepository.find.mockResolvedValue([mockInsurancePolicy]);

      const result = await service.findByAsset('asset-123');

      expect(mockInsurancePolicyRepository.find).toHaveBeenCalledWith({
        where: { assetId: 'asset-123' },
        relations: ['documents'],
        order: { coverageEnd: 'DESC' },
      });
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findByCategory', () => {
    it('should return insurance policies for a specific category', async () => {
      mockInsurancePolicyRepository.find.mockResolvedValue([mockInsurancePolicy]);

      const result = await service.findByCategory('hardware');

      expect(mockInsurancePolicyRepository.find).toHaveBeenCalledWith({
        where: { assetCategory: 'hardware' },
        relations: ['documents'],
        order: { coverageEnd: 'DESC' },
      });
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findExpiring', () => {
    it('should return insurance policies expiring within specified days', async () => {
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockInsurancePolicy]);

      const result = await service.findExpiring(30);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findExpired', () => {
    it('should return expired insurance policies', async () => {
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockInsurancePolicy]);

      const result = await service.findExpired();

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('renewPolicy', () => {
    it('should renew insurance policy successfully', async () => {
      const futureDate = '2025-12-31T23:59:59Z';
      const newInsuredValue = 60000;

      mockInsurancePolicyRepository.findOne.mockResolvedValueOnce(mockInsurancePolicy)
        .mockResolvedValueOnce({
          ...mockInsurancePolicy,
          coverageEnd: new Date(futureDate),
          insuredValue: newInsuredValue,
        });
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.renewPolicy('123e4567-e89b-12d3-a456-426614174000', futureDate, newInsuredValue);

      expect(mockInsurancePolicyRepository.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        expect.objectContaining({
          coverageEnd: new Date(futureDate),
          insuredValue: newInsuredValue,
          status: InsurancePolicyStatus.ACTIVE,
        })
      );
    });

    it('should throw BadRequestException when new coverage end date is in the past', async () => {
      const pastDate = '2023-01-01T00:00:00Z';

      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);

      await expect(service.renewPolicy('123e4567-e89b-12d3-a456-426614174000', pastDate))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadDocument', () => {
    it('should upload document successfully', async () => {
      const mockFile = {
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 1024000,
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      const uploadDto: UploadDocumentDto = {
        insurancePolicyId: '123e4567-e89b-12d3-a456-426614174000',
        documentType: 'policy',
        description: 'Main policy document',
      };

      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);
      mockPolicyDocumentRepository.create.mockReturnValue(mockPolicyDocument);
      mockPolicyDocumentRepository.save.mockResolvedValue(mockPolicyDocument);
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '');
      mockFs.writeFileSync.mockImplementation(() => {});

      const result = await service.uploadDocument(mockFile, uploadDto);

      expect(mockPolicyDocumentRepository.create).toHaveBeenCalled();
      expect(mockPolicyDocumentRepository.save).toHaveBeenCalledWith(mockPolicyDocument);
      expect(result).toEqual(mockPolicyDocument);
    });
  });

  describe('getDocuments', () => {
    it('should return documents for a policy', async () => {
      mockInsurancePolicyRepository.findOne.mockResolvedValue(mockInsurancePolicy);
      mockPolicyDocumentRepository.find.mockResolvedValue([mockPolicyDocument]);

      const result = await service.getDocuments('123e4567-e89b-12d3-a456-426614174000');

      expect(mockPolicyDocumentRepository.find).toHaveBeenCalledWith({
        where: { insurancePolicyId: '123e4567-e89b-12d3-a456-426614174000' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([mockPolicyDocument]);
    });
  });

  describe('removeDocument', () => {
    it('should remove document successfully', async () => {
      mockPolicyDocumentRepository.findOne.mockResolvedValue(mockPolicyDocument);
      mockPolicyDocumentRepository.remove.mockResolvedValue(mockPolicyDocument);
      mockFs.existsSync.mockReturnValue(true);
      mockFs.unlinkSync.mockImplementation(() => {});

      await service.removeDocument('doc-123');

      expect(mockPolicyDocumentRepository.remove).toHaveBeenCalledWith(mockPolicyDocument);
      expect(mockFs.unlinkSync).toHaveBeenCalledWith(mockPolicyDocument.filePath);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockPolicyDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.removeDocument('non-existent-doc')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPolicyAnalytics', () => {
    it('should return policy analytics', async () => {
      const mockPolicies = [
        { ...mockInsurancePolicy, status: InsurancePolicyStatus.ACTIVE, insuredValue: 50000 },
        { ...mockInsurancePolicy, status: InsurancePolicyStatus.EXPIRED, insuredValue: 30000 },
      ];

      mockInsurancePolicyRepository.find.mockResolvedValue(mockPolicies);

      const result = await service.getPolicyAnalytics();

      expect(result).toEqual({
        totalPolicies: 2,
        totalInsuredValue: 80000,
        averageInsuredValue: 40000,
        policiesByStatus: expect.any(Object),
        policiesByType: expect.any(Object),
        expiringIn30Days: expect.any(Number),
        expiringIn90Days: expect.any(Number),
      });
    });
  });

  describe('checkForExpiredPolicies', () => {
    it('should update expired policies status', async () => {
      const expiredPolicy = { ...mockInsurancePolicy, coverageEnd: new Date('2023-01-01') };
      
      mockInsurancePolicyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([expiredPolicy]);
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 1 });

      await service.checkForExpiredPolicies();

      expect(mockInsurancePolicyRepository.update).toHaveBeenCalledWith(expiredPolicy.id, {
        status: InsurancePolicyStatus.EXPIRED,
      });
    });
  });

  describe('checkForRenewalReminders', () => {
    it('should update policies due for renewal', async () => {
      const mockPolicyWithRenewalStatus = {
        ...mockInsurancePolicy,
        renewalStatus: RenewalStatus.DUE_SOON,
      };

      // Mock the service method to return policies due for renewal
      jest.spyOn(service, 'findDueForRenewal').mockResolvedValue([mockPolicyWithRenewalStatus as InsurancePolicy]);
      mockInsurancePolicyRepository.update.mockResolvedValue({ affected: 1 });

      await service.checkForRenewalReminders();

      expect(mockInsurancePolicyRepository.update).toHaveBeenCalledWith(mockPolicyWithRenewalStatus.id, {
        status: InsurancePolicyStatus.PENDING_RENEWAL,
      });
    });
  });
});
