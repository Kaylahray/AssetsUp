import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { AuditLogResponseDto, AuditLogStatsDto } from './dto/audit-log-response.dto';

export interface AuditEvent {
  actorId: string;
  actorName: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  success?: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create an audit log entry directly
   */
  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepo.create({
        ...createAuditLogDto,
        success: createAuditLogDto.success ?? true,
      });

      const savedLog = await this.auditLogRepo.save(auditLog);

      // Emit event for real-time notifications
      this.eventEmitter.emit('audit.log.created', savedLog);

      return savedLog;
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  /**
   * Log an audit event (convenience method)
   */
  async log(auditEvent: AuditEvent): Promise<AuditLog> {
    const createDto: CreateAuditLogDto = {
      actorId: auditEvent.actorId,
      actorName: auditEvent.actorName,
      action: auditEvent.action,
      resource: auditEvent.resource,
      resourceId: auditEvent.resourceId,
      description: auditEvent.description,
      details: auditEvent.details,
      ipAddress: auditEvent.ipAddress,
      userAgent: auditEvent.userAgent,
      sessionId: auditEvent.sessionId,
      requestId: auditEvent.requestId,
      success: auditEvent.success ?? true,
      errorMessage: auditEvent.errorMessage,
    };

    return this.create(createDto);
  }

  /**
   * Find all audit logs with filtering and pagination
   */
  async findAll(filterDto: FilterAuditLogDto): Promise<AuditLogResponseDto> {
    const queryBuilder = this.buildFilterQuery(filterDto);

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder
      .skip(filterDto.offset || 0)
      .take(filterDto.limit || 20);

    // Apply sorting
    const sortField = this.getSortField(filterDto.sortBy);
    queryBuilder.orderBy(sortField, filterDto.sortOrder || 'DESC');

    const data = await queryBuilder.getMany();

    // Calculate pagination metadata
    const limit = filterDto.limit || 20;
    const offset = filterDto.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        page,
        totalPages,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0,
      },
    };
  }

  /**
   * Find audit logs for a specific resource
   */
  async findByResource(
    resource: AuditResource,
    resourceId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { resource, resourceId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Find audit logs for a specific actor
   */
  async findByActor(
    actorId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditLogRepo.find({
      where: { actorId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Event listener for automatic audit logging
   */
  @OnEvent('audit.**')
  async handleAuditEvent(event: AuditEvent): Promise<void> {
    try {
      await this.log(event);
    } catch (error) {
      this.logger.error('Failed to handle audit event', error);
    }
  }

  /**
   * Get audit log statistics
   */
  async getStats(): Promise<AuditLogStatsDto> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logsLast24Hours,
      logsLast7Days,
      failedActions,
      mostActiveUsers,
      mostCommonActions,
      mostAccessedResources,
    ] = await Promise.all([
      this.auditLogRepo.count(),
      this.auditLogRepo
        .createQueryBuilder('audit')
        .where('audit.timestamp >= :last24Hours', { last24Hours })
        .getCount(),
      this.auditLogRepo
        .createQueryBuilder('audit')
        .where('audit.timestamp >= :last7Days', { last7Days })
        .getCount(),
      this.auditLogRepo.count({ where: { success: false } }),
      this.getMostActiveUsers(),
      this.getMostCommonActions(),
      this.getMostAccessedResources(),
    ]);

    return {
      totalLogs,
      logsLast24Hours,
      logsLast7Days,
      failedActions,
      mostActiveUsers,
      mostCommonActions,
      mostAccessedResources,
    };
  }

  /**
   * Build filter query based on filter DTO
   */
  private buildFilterQuery(filterDto: FilterAuditLogDto): SelectQueryBuilder<AuditLog> {
    const queryBuilder = this.auditLogRepo.createQueryBuilder('audit');

    if (filterDto.actorId) {
      queryBuilder.andWhere('audit.actorId = :actorId', { actorId: filterDto.actorId });
    }

    if (filterDto.actorName) {
      queryBuilder.andWhere('audit.actorName ILIKE :actorName', {
        actorName: `%${filterDto.actorName}%`,
      });
    }

    if (filterDto.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filterDto.action });
    }

    if (filterDto.resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: filterDto.resource });
    }

    if (filterDto.resourceId) {
      queryBuilder.andWhere('audit.resourceId = :resourceId', { resourceId: filterDto.resourceId });
    }

    if (filterDto.success !== undefined) {
      queryBuilder.andWhere('audit.success = :success', { success: filterDto.success });
    }

    if (filterDto.fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: filterDto.fromDate });
    }

    if (filterDto.toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: filterDto.toDate });
    }

    if (filterDto.description) {
      queryBuilder.andWhere('audit.description ILIKE :description', {
        description: `%${filterDto.description}%`,
      });
    }

    if (filterDto.ipAddress) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress: filterDto.ipAddress });
    }

    if (filterDto.sessionId) {
      queryBuilder.andWhere('audit.sessionId = :sessionId', { sessionId: filterDto.sessionId });
    }

    return queryBuilder;
  }

  /**
   * Get valid sort field
   */
  private getSortField(sortBy?: string): string {
    const validFields = ['timestamp', 'action', 'resource', 'actorName'];
    return validFields.includes(sortBy || '') ? `audit.${sortBy}` : 'audit.timestamp';
  }

  /**
   * Get most active users
   */
  private async getMostActiveUsers(): Promise<Array<{ actorId: string; actorName: string; count: number }>> {
    const result = await this.auditLogRepo
      .createQueryBuilder('audit')
      .select('audit.actorId', 'actorId')
      .addSelect('audit.actorName', 'actorName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.actorId, audit.actorName')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(row => ({
      actorId: row.actorId,
      actorName: row.actorName,
      count: parseInt(row.count),
    }));
  }

  /**
   * Get most common actions
   */
  private async getMostCommonActions(): Promise<Array<{ action: string; count: number }>> {
    const result = await this.auditLogRepo
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(row => ({
      action: row.action,
      count: parseInt(row.count),
    }));
  }

  /**
   * Get most accessed resources
   */
  private async getMostAccessedResources(): Promise<Array<{ resource: string; count: number }>> {
    const result = await this.auditLogRepo
      .createQueryBuilder('audit')
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    return result.map(row => ({
      resource: row.resource,
      count: parseInt(row.count),
    }));
  }
}
