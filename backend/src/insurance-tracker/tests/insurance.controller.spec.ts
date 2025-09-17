import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceController } from '../insurance.controller';
import { InsuranceService } from '../insurance.service';
import { CreateInsurancePolicyDto } from '../dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from '../dto/update-insurance-policy.dto';
import { InsuranceQueryDto } from '../dto/insurance-query.dto';
import { UploadDocumentDto } from '../dto/upload-document.dto';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel } from '../insurance.enums';

describe('InsuranceController', () => {
  let controller: InsuranceController;
  let service: InsuranceService;

  const mockInsurancePolicy = {
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

  const mockPolicyDocument = {
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

  const mockInsuranceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByAsset: jest.fn(),
    findByCategory: jest.fn(),
    findExpiring: jest.fn(),
    findExpired: jest.fn(),
    findDueForRenewal: jest.fn(),
    renewPolicy: jest.fn(),
    uploadDocument: jest.fn(),
    getDocuments: jest.fn(),
    removeDocument: jest.fn(),
    getPolicyAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceController],
      providers: [
        {
          provide: InsuranceService,
          useValue: mockInsuranceService,
        },
      ],
    }).compile();

    controller = module.get<InsuranceController>(InsuranceController);
    service = module.get<InsuranceService>(InsuranceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new insurance policy', async () => {
      const createDto: CreateInsurancePolicyDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      mockInsuranceService.create.mockResolvedValue(mockInsurancePolicy);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockInsurancePolicy);
    });
  });

  describe('findAll', () => {
    it('should return paginated insurance policies with summary', async () => {
      const queryDto: InsuranceQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const paginatedResult = {
        data: [mockInsurancePolicy],
        total: 1,
        page: 1,
        limit: 10,
        summary: {
          totalPolicies: 1,
          activePolicies: 1,
          expiredPolicies: 0,
          expiringSoon: 0,
          totalInsuredValue: 50000,
        },
      };

      mockInsuranceService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('getAnalytics', () => {
    it('should return policy analytics', async () => {
      const analytics = {
        totalPolicies: 10,
        totalInsuredValue: 500000,
        averageInsuredValue: 50000,
        policiesByStatus: { active: 8, expired: 2 },
        policiesByType: { comprehensive: 6, liability: 4 },
        expiringIn30Days: 2,
        expiringIn90Days: 5,
      };

      mockInsuranceService.getPolicyAnalytics.mockResolvedValue(analytics);

      const result = await controller.getAnalytics();

      expect(service.getPolicyAnalytics).toHaveBeenCalled();
      expect(result).toEqual(analytics);
    });
  });

  describe('findOne', () => {
    it('should return a single insurance policy', async () => {
      mockInsuranceService.findOne.mockResolvedValue(mockInsurancePolicy);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockInsurancePolicy);
    });
  });

  describe('update', () => {
    it('should update an insurance policy', async () => {
      const updateDto: UpdateInsurancePolicyDto = {
        provider: 'Updated Insurance Co.',
        status: InsurancePolicyStatus.SUSPENDED,
      };

      const updatedPolicy = { ...mockInsurancePolicy, ...updateDto };
      mockInsuranceService.update.mockResolvedValue(updatedPolicy);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(service.update).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateDto);
      expect(result).toEqual(updatedPolicy);
    });
  });

  describe('remove', () => {
    it('should delete an insurance policy', async () => {
      mockInsuranceService.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('findByAsset', () => {
    it('should return insurance policies for a specific asset', async () => {
      mockInsuranceService.findByAsset.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findByAsset('asset-123');

      expect(service.findByAsset).toHaveBeenCalledWith('asset-123');
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findByCategory', () => {
    it('should return insurance policies for a specific category', async () => {
      mockInsuranceService.findByCategory.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findByCategory('hardware');

      expect(service.findByCategory).toHaveBeenCalledWith('hardware');
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findExpiring', () => {
    it('should return expiring insurance policies with default days', async () => {
      mockInsuranceService.findExpiring.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findExpiring();

      expect(service.findExpiring).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockInsurancePolicy]);
    });

    it('should return expiring insurance policies with custom days', async () => {
      mockInsuranceService.findExpiring.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findExpiring(60);

      expect(service.findExpiring).toHaveBeenCalledWith(60);
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findExpired', () => {
    it('should return expired insurance policies', async () => {
      mockInsuranceService.findExpired.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findExpired();

      expect(service.findExpired).toHaveBeenCalled();
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('findDueForRenewal', () => {
    it('should return policies due for renewal', async () => {
      mockInsuranceService.findDueForRenewal.mockResolvedValue([mockInsurancePolicy]);

      const result = await controller.findDueForRenewal();

      expect(service.findDueForRenewal).toHaveBeenCalled();
      expect(result).toEqual([mockInsurancePolicy]);
    });
  });

  describe('renewPolicy', () => {
    it('should renew an insurance policy', async () => {
      const renewalData = {
        newCoverageEnd: '2025-12-31T23:59:59Z',
        newInsuredValue: 60000,
      };

      const renewedPolicy = {
        ...mockInsurancePolicy,
        coverageEnd: new Date(renewalData.newCoverageEnd),
        insuredValue: renewalData.newInsuredValue,
      };

      mockInsuranceService.renewPolicy.mockResolvedValue(renewedPolicy);

      const result = await controller.renewPolicy('123e4567-e89b-12d3-a456-426614174000', renewalData);

      expect(service.renewPolicy).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        renewalData.newCoverageEnd,
        renewalData.newInsuredValue
      );
      expect(result).toEqual(renewedPolicy);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document for an insurance policy', async () => {
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

      mockInsuranceService.uploadDocument.mockResolvedValue(mockPolicyDocument);

      const result = await controller.uploadDocument('123e4567-e89b-12d3-a456-426614174000', mockFile, uploadDto);

      expect(service.uploadDocument).toHaveBeenCalledWith(mockFile, {
        ...uploadDto,
        insurancePolicyId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result).toEqual(mockPolicyDocument);
    });
  });

  describe('getDocuments', () => {
    it('should return documents for an insurance policy', async () => {
      mockInsuranceService.getDocuments.mockResolvedValue([mockPolicyDocument]);

      const result = await controller.getDocuments('123e4567-e89b-12d3-a456-426614174000');

      expect(service.getDocuments).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual([mockPolicyDocument]);
    });
  });

  describe('removeDocument', () => {
    it('should delete a policy document', async () => {
      mockInsuranceService.removeDocument.mockResolvedValue(undefined);

      await controller.removeDocument('doc-123');

      expect(service.removeDocument).toHaveBeenCalledWith('doc-123');
    });
  });
});
