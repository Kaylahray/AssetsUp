import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { ChangeLog, ChangeLogAction } from './entities/change-log.entity';
import { CreateChangeLogDto, FilterChangeLogDto } from './dto/create-change-log.dto';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ChangeLogService {
  constructor(
    @InjectRepository(ChangeLog)
    private readonly changeLogRepository: Repository<ChangeLog>,
  ) {}

  /**
   * Log a change made to any entity
   */
  async logChange(dto: CreateChangeLogDto): Promise<ChangeLog> {
    const changeLog = this.changeLogRepository.create(dto);
    return this.changeLogRepository.save(changeLog);
  }

  /**
   * Get all change logs with optional filtering and pagination
   */
  async findAll(filter: FilterChangeLogDto): Promise<PaginatedResult<ChangeLog>> {
    const { page = 1, limit = 10, fromDate, toDate, ...whereClause } = filter;
    
    const findOptions: FindManyOptions<ChangeLog> = {
      where: {},
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    };

    // Apply filters
    if (filter.entityType) {
      findOptions.where['entityType'] = filter.entityType;
    }
    if (filter.entityId) {
      findOptions.where['entityId'] = filter.entityId;
    }
    if (filter.userId) {
      findOptions.where['userId'] = filter.userId;
    }
    if (filter.action) {
      findOptions.where['action'] = filter.action;
    }
    if (fromDate || toDate) {
      const dateFilter: any = {};
      if (fromDate) dateFilter.from = new Date(fromDate);
      if (toDate) dateFilter.to = new Date(toDate);
      
      if (dateFilter.from && dateFilter.to) {
        findOptions.where['createdAt'] = Between(dateFilter.from, dateFilter.to);
      } else if (dateFilter.from) {
        findOptions.where['createdAt'] = Between(dateFilter.from, new Date());
      } else if (dateFilter.to) {
        findOptions.where['createdAt'] = Between(new Date('1970-01-01'), dateFilter.to);
      }
    }

    const [data, total] = await this.changeLogRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get change logs for a specific entity
   */
  async findByEntity(entityType: string, entityId: string): Promise<ChangeLog[]> {
    return this.changeLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get change logs by user
   */
  async findByUser(userId: string): Promise<ChangeLog[]> {
    return this.changeLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get change logs by date range
   */
  async findByDateRange(fromDate: Date, toDate: Date): Promise<ChangeLog[]> {
    return this.changeLogRepository.find({
      where: {
        createdAt: Between(fromDate, toDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get statistics about changes
   */
  async getStatistics(days: number = 30): Promise<any> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const totalChanges = await this.changeLogRepository.count({
      where: { createdAt: Between(fromDate, new Date()) },
    });

    const changesByAction = await this.changeLogRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :fromDate', { fromDate })
      .groupBy('log.action')
      .getRawMany();

    const changesByEntityType = await this.changeLogRepository
      .createQueryBuilder('log')
      .select('log.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :fromDate', { fromDate })
      .groupBy('log.entityType')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = await this.changeLogRepository
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('log.userName', 'userName')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :fromDate', { fromDate })
      .groupBy('log.userId, log.userName')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalChanges,
      changesByAction,
      changesByEntityType,
      topUsers,
      periodDays: days,
    };
  }

  /**
   * Generate mock changes for demo purposes
   */
  async generateMockChanges(): Promise<void> {
    const mockUsers = [
      { id: 'user-1', name: 'John Doe' },
      { id: 'user-2', name: 'Jane Smith' },
      { id: 'user-3', name: 'Bob Johnson' },
      { id: 'admin-1', name: 'Admin User' },
    ];

    const mockEntities = [
      { type: 'User', ids: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'] },
      { type: 'Asset', ids: ['asset-uuid-1', 'asset-uuid-2', 'asset-uuid-3'] },
      { type: 'Insurance', ids: ['insurance-1', 'insurance-2'] },
      { type: 'Incident', ids: ['incident-1', 'incident-2', 'incident-3'] },
      { type: 'OrganizationUnit', ids: ['org-uuid-1', 'org-uuid-2'] },
    ];

    const actions = Object.values(ChangeLogAction);
    
    const mockChanges: CreateChangeLogDto[] = [];

    // Generate 50 mock changes
    for (let i = 0; i < 50; i++) {
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const entity = mockEntities[Math.floor(Math.random() * mockEntities.length)];
      const entityId = entity.ids[Math.floor(Math.random() * entity.ids.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];

      let oldValues: any = null;
      let newValues: any = null;
      let changedFields: string[] = [];

      // Generate realistic change data based on entity type and action
      if (action === ChangeLogAction.CREATE) {
        newValues = this.generateMockEntityData(entity.type);
        changedFields = Object.keys(newValues);
      } else if (action === ChangeLogAction.UPDATE) {
        oldValues = this.generateMockEntityData(entity.type);
        newValues = { ...oldValues };
        
        // Change a few fields
        const fieldsToChange = Object.keys(newValues).slice(0, Math.floor(Math.random() * 3) + 1);
        fieldsToChange.forEach(field => {
          newValues[field] = this.generateRandomValue(field);
        });
        changedFields = fieldsToChange;
      } else if (action === ChangeLogAction.DELETE) {
        oldValues = this.generateMockEntityData(entity.type);
        changedFields = Object.keys(oldValues);
      }

      const changeLog: CreateChangeLogDto = {
        entityType: entity.type,
        entityId,
        action,
        userId: user.id,
        userName: user.name,
        oldValues,
        newValues,
        changedFields,
        metadata: {
          source: 'demo',
          timestamp: new Date().toISOString(),
        },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'ManageAssets-Demo/1.0',
      };

      mockChanges.push(changeLog);
    }

    // Save all mock changes
    for (const change of mockChanges) {
      await this.logChange(change);
      // Add small delay to spread timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private generateMockEntityData(entityType: string): Record<string, any> {
    switch (entityType) {
      case 'User':
        return {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'employee',
          department: 'IT',
          isActive: true,
        };
      case 'Asset':
        return {
          name: 'Laptop Dell XPS 13',
          category: 'Electronics',
          serialNumber: 'DL-XPS-2024-001',
          status: 'active',
          value: 1200.00,
        };
      case 'Insurance':
        return {
          assetName: 'Company Vehicle',
          insurer: 'ABC Insurance',
          policyNumber: 'POL-2024-001',
          coverageType: 'Comprehensive',
        };
      case 'Incident':
        return {
          description: 'Equipment malfunction',
          category: 'Hardware',
          severity: 'Medium',
          resolutionStatus: 'pending',
        };
      case 'OrganizationUnit':
        return {
          name: 'Lagos Branch',
          type: 'branch',
          head: 'Jane Manager',
        };
      default:
        return {
          name: 'Generic Entity',
          status: 'active',
          updatedBy: 'system',
        };
    }
  }

  private generateRandomValue(field: string): any {
    switch (field) {
      case 'name':
        return ['John Doe', 'Jane Smith', 'Bob Johnson'][Math.floor(Math.random() * 3)];
      case 'email':
        return ['john@example.com', 'jane@example.com', 'bob@example.com'][Math.floor(Math.random() * 3)];
      case 'status':
        return ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)];
      case 'isActive':
        return Math.random() > 0.5;
      case 'value':
        return Math.floor(Math.random() * 5000) + 100;
      case 'severity':
        return ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)];
      default:
        return `Updated ${field} ${Date.now()}`;
    }
  }
}