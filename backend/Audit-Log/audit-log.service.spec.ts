import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService, AuditEvent } from './audit-log.service';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repository: Repository<AuditLog>;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset mocks
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an audit log entry', async () => {
      const createDto: CreateAuditLogDto = {
        actorId: 'user-123',
        actorName: 'john.doe@example.com',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        resourceId: 'asset-123',
        description: 'Created new asset',
        details: { name: 'Test Asset' },
        success: true,
      };

      const mockAuditLog = {
        id: 'audit-123',
        ...createDto,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAuditLog);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        success: true,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('audit.log.created', mockAuditLog);
    });

    it('should default success to true if not provided', async () => {
      const createDto: CreateAuditLogDto = {
        actorId: 'user-123',
        actorName: 'john.doe@example.com',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created new asset',
      };

      const mockAuditLog = { id: 'audit-123', ...createDto, success: true };
      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        success: true,
      });
    });
  });

  describe('log', () => {
    it('should log an audit event', async () => {
      const auditEvent: AuditEvent = {
        actorId: 'user-123',
        actorName: 'john.doe@example.com',
        action: AuditAction.UPDATE,
        resource: AuditResource.ASSET,
        resourceId: 'asset-123',
        description: 'Updated asset',
        details: { oldValue: 'old', newValue: 'new' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        sessionId: 'sess-123',
        requestId: 'req-123',
        success: true,
      };

      const mockAuditLog = { id: 'audit-123', ...auditEvent };
      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(auditEvent);

      expect(result).toEqual(mockAuditLog);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...auditEvent,
        success: true,
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const filterDto: FilterAuditLogDto = {
        limit: 10,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      };

      const mockAuditLogs = [
        {
          id: 'audit-1',
          actorId: 'user-123',
          action: AuditAction.CREATE,
          resource: AuditResource.ASSET,
          timestamp: new Date(),
        },
        {
          id: 'audit-2',
          actorId: 'user-123',
          action: AuditAction.UPDATE,
          resource: AuditResource.ASSET,
          timestamp: new Date(),
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(25);
      mockQueryBuilder.getMany.mockResolvedValue(mockAuditLogs);

      const result = await service.findAll(filterDto);

      expect(result.data).toEqual(mockAuditLogs);
      expect(result.meta).toEqual({
        total: 25,
        limit: 10,
        offset: 0,
        page: 1,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      });
    });

    it('should apply filters correctly', async () => {
      const filterDto: FilterAuditLogDto = {
        actorId: 'user-123',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        success: true,
        fromDate: '2024-01-01T00:00:00.000Z',
        toDate: '2024-12-31T23:59:59.999Z',
      };

      mockQueryBuilder.getCount.mockResolvedValue(5);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(filterDto);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.actorId = :actorId', {
        actorId: 'user-123',
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.action = :action', {
        action: AuditAction.CREATE,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.resource = :resource', {
        resource: AuditResource.ASSET,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('audit.success = :success', {
        success: true,
      });
    });
  });

  describe('findByResource', () => {
    it('should find audit logs for a specific resource', async () => {
      const resource = AuditResource.ASSET;
      const resourceId = 'asset-123';
      const limit = 50;

      const mockAuditLogs = [
        {
          id: 'audit-1',
          resource,
          resourceId,
          action: AuditAction.CREATE,
        },
      ];

      mockRepository.find.mockResolvedValue(mockAuditLogs);

      const result = await service.findByResource(resource, resourceId, limit);

      expect(result).toEqual(mockAuditLogs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { resource, resourceId },
        order: { timestamp: 'DESC' },
        take: limit,
      });
    });
  });

  describe('findByActor', () => {
    it('should find audit logs for a specific actor', async () => {
      const actorId = 'user-123';
      const limit = 50;

      const mockAuditLogs = [
        {
          id: 'audit-1',
          actorId,
          action: AuditAction.CREATE,
        },
      ];

      mockRepository.find.mockResolvedValue(mockAuditLogs);

      const result = await service.findByActor(actorId, limit);

      expect(result).toEqual(mockAuditLogs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { actorId },
        order: { timestamp: 'DESC' },
        take: limit,
      });
    });
  });

  describe('handleAuditEvent', () => {
    it('should handle audit events', async () => {
      const auditEvent: AuditEvent = {
        actorId: 'user-123',
        actorName: 'john.doe@example.com',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
        success: true,
      };

      const mockAuditLog = { id: 'audit-123', ...auditEvent };
      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      await service.handleAuditEvent(auditEvent);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const auditEvent: AuditEvent = {
        actorId: 'user-123',
        actorName: 'john.doe@example.com',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
        success: true,
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Should not throw
      await expect(service.handleAuditEvent(auditEvent)).resolves.toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return audit log statistics', async () => {
      const mockStats = {
        totalLogs: 1000,
        logsLast24Hours: 50,
        logsLast7Days: 300,
        failedActions: 25,
        mostActiveUsers: [
          { actorId: 'user-1', actorName: 'john.doe@example.com', count: 100 },
        ],
        mostCommonActions: [
          { action: 'CREATE', count: 400 },
        ],
        mostAccessedResources: [
          { resource: 'ASSET', count: 600 },
        ],
      };

      mockRepository.count
        .mockResolvedValueOnce(1000) // totalLogs
        .mockResolvedValueOnce(25); // failedActions

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(50) // logsLast24Hours
        .mockResolvedValueOnce(300); // logsLast7Days

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ actorId: 'user-1', actorName: 'john.doe@example.com', count: '100' }])
        .mockResolvedValueOnce([{ action: 'CREATE', count: '400' }])
        .mockResolvedValueOnce([{ resource: 'ASSET', count: '600' }]);

      const result = await service.getStats();

      expect(result.totalLogs).toBe(1000);
      expect(result.logsLast24Hours).toBe(50);
      expect(result.logsLast7Days).toBe(300);
      expect(result.failedActions).toBe(25);
      expect(result.mostActiveUsers).toHaveLength(1);
      expect(result.mostCommonActions).toHaveLength(1);
      expect(result.mostAccessedResources).toHaveLength(1);
    });
  });
});
