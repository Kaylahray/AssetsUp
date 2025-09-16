import { Test, TestingModule } from '@nestjs/testing';
import { SLAController } from '../sla.controller';
import { SLAService } from '../sla.service';
import { CreateSLARecordDto } from '../dto/create-sla-record.dto';
import { UpdateSLARecordDto } from '../dto/update-sla-record.dto';
import { CreateSLABreachDto } from '../dto/create-sla-breach.dto';
import { SLAQueryDto } from '../dto/sla-query.dto';
import { SLAStatus, SLAPriority, AssetCategory, SLABreachSeverity } from '../sla.enums';

describe('SLAController', () => {
  let controller: SLAController;
  let service: SLAService;

  const mockSLARecord = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    vendorId: 'vendor-123',
    serviceDescription: 'Hardware maintenance service',
    coverageStart: new Date('2024-01-01'),
    coverageEnd: new Date('2024-12-31'),
    assetCategory: AssetCategory.HARDWARE,
    breachPolicy: 'Standard breach policy',
    status: SLAStatus.ACTIVE,
    priority: SLAPriority.MEDIUM,
    responseTimeHours: 24,
    resolutionTimeHours: 72,
    uptimePercentage: 99.9,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSLABreach = {
    id: 'breach-123',
    slaRecordId: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Response time exceeded',
    severity: SLABreachSeverity.MINOR,
    breachTime: new Date(),
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSLAService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByVendor: jest.fn(),
    findExpiring: jest.fn(),
    findExpired: jest.fn(),
    createBreach: jest.fn(),
    findBreachesBySLA: jest.fn(),
    resolveBreach: jest.fn(),
    mockBreachTrigger: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SLAController],
      providers: [
        {
          provide: SLAService,
          useValue: mockSLAService,
        },
      ],
    }).compile();

    controller = module.get<SLAController>(SLAController);
    service = module.get<SLAService>(SLAService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new SLA record', async () => {
      const createDto: CreateSLARecordDto = {
        vendorId: 'vendor-123',
        serviceDescription: 'Hardware maintenance service',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
      };

      mockSLAService.create.mockResolvedValue(mockSLARecord);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSLARecord);
    });
  });

  describe('findAll', () => {
    it('should return paginated SLA records', async () => {
      const queryDto: SLAQueryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      };

      const paginatedResult = {
        data: [mockSLARecord],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockSLAService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(queryDto);

      expect(service.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single SLA record', async () => {
      mockSLAService.findOne.mockResolvedValue(mockSLARecord);

      const result = await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual(mockSLARecord);
    });
  });

  describe('update', () => {
    it('should update an SLA record', async () => {
      const updateDto: UpdateSLARecordDto = {
        serviceDescription: 'Updated service description',
        status: SLAStatus.SUSPENDED,
      };

      const updatedRecord = { ...mockSLARecord, ...updateDto };
      mockSLAService.update.mockResolvedValue(updatedRecord);

      const result = await controller.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(service.update).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', updateDto);
      expect(result).toEqual(updatedRecord);
    });
  });

  describe('remove', () => {
    it('should delete an SLA record', async () => {
      mockSLAService.remove.mockResolvedValue(undefined);

      await controller.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(service.remove).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('findByVendor', () => {
    it('should return SLA records for a specific vendor', async () => {
      mockSLAService.findByVendor.mockResolvedValue([mockSLARecord]);

      const result = await controller.findByVendor('vendor-123');

      expect(service.findByVendor).toHaveBeenCalledWith('vendor-123');
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('findExpiring', () => {
    it('should return expiring SLA records with default days', async () => {
      mockSLAService.findExpiring.mockResolvedValue([mockSLARecord]);

      const result = await controller.findExpiring();

      expect(service.findExpiring).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockSLARecord]);
    });

    it('should return expiring SLA records with custom days', async () => {
      mockSLAService.findExpiring.mockResolvedValue([mockSLARecord]);

      const result = await controller.findExpiring(60);

      expect(service.findExpiring).toHaveBeenCalledWith(60);
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('findExpired', () => {
    it('should return expired SLA records', async () => {
      mockSLAService.findExpired.mockResolvedValue([mockSLARecord]);

      const result = await controller.findExpired();

      expect(service.findExpired).toHaveBeenCalled();
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('createBreach', () => {
    it('should create a new SLA breach', async () => {
      const createBreachDto: CreateSLABreachDto = {
        slaRecordId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Response time exceeded',
        severity: SLABreachSeverity.MINOR,
        breachTime: new Date().toISOString(),
      };

      mockSLAService.createBreach.mockResolvedValue(mockSLABreach);

      const result = await controller.createBreach(createBreachDto);

      expect(service.createBreach).toHaveBeenCalledWith(createBreachDto);
      expect(result).toEqual(mockSLABreach);
    });
  });

  describe('findBreachesBySLA', () => {
    it('should return breaches for a specific SLA record', async () => {
      mockSLAService.findBreachesBySLA.mockResolvedValue([mockSLABreach]);

      const result = await controller.findBreachesBySLA('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findBreachesBySLA).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
      expect(result).toEqual([mockSLABreach]);
    });
  });

  describe('resolveBreach', () => {
    it('should resolve an SLA breach', async () => {
      const resolvedBreach = { ...mockSLABreach, isResolved: true };
      mockSLAService.resolveBreach.mockResolvedValue(resolvedBreach);

      const result = await controller.resolveBreach('breach-123', 'Issue resolved');

      expect(service.resolveBreach).toHaveBeenCalledWith('breach-123', 'Issue resolved');
      expect(result).toEqual(resolvedBreach);
    });
  });

  describe('mockBreachTrigger', () => {
    it('should trigger a mock breach', async () => {
      mockSLAService.mockBreachTrigger.mockResolvedValue(mockSLABreach);

      const result = await controller.mockBreachTrigger('123e4567-e89b-12d3-a456-426614174000', 'Test breach');

      expect(service.mockBreachTrigger).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000', 'Test breach');
      expect(result).toEqual(mockSLABreach);
    });
  });
});
