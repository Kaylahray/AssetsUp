import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogController } from './audit-log.controller';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { AuditAction, AuditResource } from './entities/audit-log.entity';

describe('AuditLogController', () => {
  let controller: AuditLogController;
  let service: AuditLogService;

  const mockAuditLogService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getStats: jest.fn(),
    findByResource: jest.fn(),
    findByActor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogController],
      providers: [
        {
          provide: AuditLogService,
          useValue: mockAuditLogService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogController>(AuditLogController);
    service = module.get<AuditLogService>(AuditLogService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
        success: true,
      };

      const expectedResult = {
        id: 'audit-123',
        ...createDto,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuditLogService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuditLogService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated audit logs', async () => {
      const filterDto: FilterAuditLogDto = {
        limit: 20,
        offset: 0,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      };

      const expectedResult = {
        data: [
          {
            id: 'audit-1',
            actorId: 'user-123',
            action: AuditAction.CREATE,
            resource: AuditResource.ASSET,
            timestamp: new Date(),
          },
        ],
        meta: {
          total: 1,
          limit: 20,
          offset: 0,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      };

      mockAuditLogService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filterDto);

      expect(result).toEqual(expectedResult);
      expect(mockAuditLogService.findAll).toHaveBeenCalledWith(filterDto);
    });
  });

  describe('getStats', () => {
    it('should return audit log statistics', async () => {
      const expectedStats = {
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

      mockAuditLogService.getStats.mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(result).toEqual(expectedStats);
      expect(mockAuditLogService.getStats).toHaveBeenCalled();
    });
  });

  describe('findByResource', () => {
    it('should return audit logs for a specific resource', async () => {
      const resource = AuditResource.ASSET;
      const resourceId = 'asset-123';
      const limit = 50;

      const expectedResult = [
        {
          id: 'audit-1',
          resource,
          resourceId,
          action: AuditAction.CREATE,
          timestamp: new Date(),
        },
      ];

      mockAuditLogService.findByResource.mockResolvedValue(expectedResult);

      const result = await controller.findByResource(resource, resourceId, limit);

      expect(result).toEqual(expectedResult);
      expect(mockAuditLogService.findByResource).toHaveBeenCalledWith(resource, resourceId, limit);
    });
  });

  describe('findByActor', () => {
    it('should return audit logs for a specific actor', async () => {
      const actorId = 'user-123';
      const limit = 50;

      const expectedResult = [
        {
          id: 'audit-1',
          actorId,
          action: AuditAction.CREATE,
          timestamp: new Date(),
        },
      ];

      mockAuditLogService.findByActor.mockResolvedValue(expectedResult);

      const result = await controller.findByActor(actorId, limit);

      expect(result).toEqual(expectedResult);
      expect(mockAuditLogService.findByActor).toHaveBeenCalledWith(actorId, limit);
    });
  });

  describe('getMyLogs', () => {
    it('should return audit logs for the current user', async () => {
      const mockRequest = {
        user: {
          id: 'user-123',
          email: 'john.doe@example.com',
        },
      };
      const limit = 50;

      const expectedResult = [
        {
          id: 'audit-1',
          actorId: 'user-123',
          action: AuditAction.CREATE,
          timestamp: new Date(),
        },
      ];

      mockAuditLogService.findByActor.mockResolvedValue(expectedResult);

      const result = await controller.getMyLogs(mockRequest, limit);

      expect(result).toEqual(expectedResult);
      expect(mockAuditLogService.findByActor).toHaveBeenCalledWith('user-123', limit);
    });
  });
});
