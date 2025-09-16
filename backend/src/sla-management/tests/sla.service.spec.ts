import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SLAService } from '../sla.service';
import { SLARecord } from '../entities/sla-record.entity';
import { SLABreach } from '../entities/sla-breach.entity';
import { SLAStatus, SLAPriority, AssetCategory, SLABreachSeverity } from '../sla.enums';
import { CreateSLARecordDto } from '../dto/create-sla-record.dto';
import { UpdateSLARecordDto } from '../dto/update-sla-record.dto';
import { CreateSLABreachDto } from '../dto/create-sla-breach.dto';

describe('SLAService', () => {
  let service: SLAService;
  let slaRecordRepository: Repository<SLARecord>;
  let slaBreachRepository: Repository<SLABreach>;

  const mockSLARecord: Partial<SLARecord> = {
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

  const mockSLABreach: Partial<SLABreach> = {
    id: 'breach-123',
    slaRecordId: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Response time exceeded',
    severity: SLABreachSeverity.MINOR,
    breachTime: new Date(),
    isResolved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSLARecordRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockSLABreachRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
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
        SLAService,
        {
          provide: getRepositoryToken(SLARecord),
          useValue: mockSLARecordRepository,
        },
        {
          provide: getRepositoryToken(SLABreach),
          useValue: mockSLABreachRepository,
        },
      ],
    }).compile();

    service = module.get<SLAService>(SLAService);
    slaRecordRepository = module.get<Repository<SLARecord>>(getRepositoryToken(SLARecord));
    slaBreachRepository = module.get<Repository<SLABreach>>(getRepositoryToken(SLABreach));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new SLA record successfully', async () => {
      const createDto: CreateSLARecordDto = {
        vendorId: 'vendor-123',
        serviceDescription: 'Hardware maintenance service',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
      };

      mockSLARecordRepository.create.mockReturnValue(mockSLARecord);
      mockSLARecordRepository.save.mockResolvedValue(mockSLARecord);

      const result = await service.create(createDto);

      expect(mockSLARecordRepository.create).toHaveBeenCalledWith({
        ...createDto,
        coverageStart: new Date(createDto.coverageStart),
        coverageEnd: new Date(createDto.coverageEnd),
      });
      expect(mockSLARecordRepository.save).toHaveBeenCalledWith(mockSLARecord);
      expect(result).toEqual(mockSLARecord);
    });

    it('should throw BadRequestException when start date is after end date', async () => {
      const createDto: CreateSLARecordDto = {
        vendorId: 'vendor-123',
        serviceDescription: 'Hardware maintenance service',
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return SLA record when found', async () => {
      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSLARecordRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['vendor', 'breaches'],
      });
      expect(result).toEqual(mockSLARecord);
    });

    it('should throw NotFoundException when SLA record not found', async () => {
      mockSLARecordRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated SLA records', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      mockSLARecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockSLARecord]);

      const result = await service.findAll(queryDto);

      expect(result).toEqual({
        data: [mockSLARecord],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('update', () => {
    it('should update SLA record successfully', async () => {
      const updateDto: UpdateSLARecordDto = {
        serviceDescription: 'Updated service description',
        status: SLAStatus.SUSPENDED,
      };

      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);
      mockSLARecordRepository.update.mockResolvedValue({ affected: 1 });
      mockSLARecordRepository.findOne.mockResolvedValueOnce(mockSLARecord)
        .mockResolvedValueOnce({ ...mockSLARecord, ...updateDto });

      const result = await service.update('123e4567-e89b-12d3-a456-426614174000', updateDto);

      expect(mockSLARecordRepository.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updateDto
      );
      expect(result).toEqual({ ...mockSLARecord, ...updateDto });
    });

    it('should throw BadRequestException when updating with invalid dates', async () => {
      const updateDto: UpdateSLARecordDto = {
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
      };

      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);

      await expect(service.update('123e4567-e89b-12d3-a456-426614174000', updateDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove SLA record successfully', async () => {
      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);
      mockSLARecordRepository.remove.mockResolvedValue(mockSLARecord);

      await service.remove('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSLARecordRepository.remove).toHaveBeenCalledWith(mockSLARecord);
    });
  });

  describe('findByVendor', () => {
    it('should return SLA records for a specific vendor', async () => {
      mockSLARecordRepository.find.mockResolvedValue([mockSLARecord]);

      const result = await service.findByVendor('vendor-123');

      expect(mockSLARecordRepository.find).toHaveBeenCalledWith({
        where: { vendorId: 'vendor-123' },
        relations: ['vendor', 'breaches'],
      });
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('findExpiring', () => {
    it('should return SLA records expiring within specified days', async () => {
      mockSLARecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockSLARecord]);

      const result = await service.findExpiring(30);

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('findExpired', () => {
    it('should return expired SLA records', async () => {
      mockSLARecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([mockSLARecord]);

      const result = await service.findExpired();

      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result).toEqual([mockSLARecord]);
    });
  });

  describe('createBreach', () => {
    it('should create a new SLA breach successfully', async () => {
      const createBreachDto: CreateSLABreachDto = {
        slaRecordId: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Response time exceeded',
        severity: SLABreachSeverity.MINOR,
        breachTime: new Date().toISOString(),
      };

      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);
      mockSLABreachRepository.create.mockReturnValue(mockSLABreach);
      mockSLABreachRepository.save.mockResolvedValue(mockSLABreach);

      const result = await service.createBreach(createBreachDto);

      expect(mockSLABreachRepository.create).toHaveBeenCalled();
      expect(mockSLABreachRepository.save).toHaveBeenCalledWith(mockSLABreach);
      expect(result).toEqual(mockSLABreach);
    });
  });

  describe('resolveBreach', () => {
    it('should resolve SLA breach successfully', async () => {
      const resolvedBreach = { ...mockSLABreach, isResolved: true };
      
      mockSLABreachRepository.findOne.mockResolvedValueOnce(mockSLABreach)
        .mockResolvedValueOnce(resolvedBreach);
      mockSLABreachRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.resolveBreach('breach-123', 'Issue resolved');

      expect(mockSLABreachRepository.update).toHaveBeenCalledWith('breach-123', {
        isResolved: true,
        resolvedTime: expect.any(Date),
        resolutionTimeHours: expect.any(Number),
        resolutionNotes: 'Issue resolved',
      });
      expect(result).toEqual(resolvedBreach);
    });

    it('should throw NotFoundException when breach not found', async () => {
      mockSLABreachRepository.findOne.mockResolvedValue(null);

      await expect(service.resolveBreach('non-existent-breach', 'Notes'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('mockBreachTrigger', () => {
    it('should create a mock breach successfully', async () => {
      mockSLARecordRepository.findOne.mockResolvedValue(mockSLARecord);
      mockSLABreachRepository.create.mockReturnValue(mockSLABreach);
      mockSLABreachRepository.save.mockResolvedValue(mockSLABreach);

      const result = await service.mockBreachTrigger('123e4567-e89b-12d3-a456-426614174000', 'Test breach');

      expect(mockSLABreachRepository.create).toHaveBeenCalled();
      expect(mockSLABreachRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockSLABreach);
    });
  });

  describe('checkForExpiredSLAs', () => {
    it('should update expired SLAs status', async () => {
      const expiredSLA = { ...mockSLARecord, coverageEnd: new Date('2023-01-01') };
      
      mockSLARecordRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([expiredSLA]);
      mockSLARecordRepository.update.mockResolvedValue({ affected: 1 });

      await service.checkForExpiredSLAs();

      expect(mockSLARecordRepository.update).toHaveBeenCalledWith(expiredSLA.id, {
        status: SLAStatus.EXPIRED,
      });
    });
  });
});
