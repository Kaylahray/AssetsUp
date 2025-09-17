import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual, Like, IsNull, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { Ticket } from './entities/ticket.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketSource,
} from './feedback-support.enums';

@Injectable()
export class FeedbackSupportService {
  private readonly logger = new Logger(FeedbackSupportService.name);
  private readonly uploadPath = './uploads/tickets';

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketAttachment)
    private readonly attachmentRepository: Repository<TicketAttachment>,
  ) {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    try {
      const ticket = this.ticketRepository.create({
        ...createTicketDto,
        status: TicketStatus.OPEN,
        priority: createTicketDto.priority || TicketPriority.MEDIUM,
        category: createTicketDto.category || TicketCategory.GENERAL_INQUIRY,
        source: createTicketDto.source || TicketSource.WEB_PORTAL,
        dueDate: createTicketDto.dueDate ? new Date(createTicketDto.dueDate) : null,
        lastActivityAt: new Date(),
        metadata: {
          ...createTicketDto.metadata,
          created_via: 'api',
          ip_address: 'unknown',
        },
      });

      const savedTicket = await this.ticketRepository.save(ticket);
      this.logger.log(`Created ticket: ${savedTicket.id} for user: ${savedTicket.userId}`);
      
      return savedTicket;
    } catch (error) {
      this.logger.error(`Failed to create ticket: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create ticket');
    }
  }

  async findAll(query: TicketQueryDto): Promise<{
    tickets: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    analytics: any;
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.statuses && filters.statuses.length > 0) where.status = In(filters.statuses);
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;
    if (filters.source) where.source = filters.source;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters.assetId) where.assetId = filters.assetId;

    // Date range filtering
    if (filters.fromDate && filters.toDate) {
      where.createdAt = Between(new Date(filters.fromDate), new Date(filters.toDate));
    } else if (filters.fromDate) {
      where.createdAt = MoreThanOrEqual(new Date(filters.fromDate));
    } else if (filters.toDate) {
      where.createdAt = LessThanOrEqual(new Date(filters.toDate));
    }

    // Due date filtering
    if (filters.dueDateFrom && filters.dueDateTo) {
      where.dueDate = Between(new Date(filters.dueDateFrom), new Date(filters.dueDateTo));
    } else if (filters.dueDateFrom) {
      where.dueDate = MoreThanOrEqual(new Date(filters.dueDateFrom));
    } else if (filters.dueDateTo) {
      where.dueDate = LessThanOrEqual(new Date(filters.dueDateTo));
    }

    // Unassigned filter
    if (filters.unassigned) {
      where.assignedTo = IsNull();
    }

    const findOptions: FindManyOptions<Ticket> = {
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
      relations: ['attachments'],
    };

    // Handle complex filters
    let queryBuilder = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.attachments', 'attachments');

    // Apply where conditions
    Object.keys(where).forEach(key => {
      if (key === 'createdAt' || key === 'dueDate') {
        // Handle date ranges
        if (where[key].type === 'between') {
          queryBuilder.andWhere(`ticket.${key} BETWEEN :${key}Start AND :${key}End`, {
            [`${key}Start`]: where[key].from,
            [`${key}End`]: where[key].to,
          });
        } else if (where[key].type === 'moreThanOrEqual') {
          queryBuilder.andWhere(`ticket.${key} >= :${key}`, { [key]: where[key].value });
        } else if (where[key].type === 'lessThanOrEqual') {
          queryBuilder.andWhere(`ticket.${key} <= :${key}`, { [key]: where[key].value });
        }
      } else if (key === 'status' && Array.isArray(where[key])) {
        queryBuilder.andWhere(`ticket.${key} IN (:...${key})`, { [key]: where[key] });
      } else if (where[key] === null || (typeof where[key] === 'object' && where[key].type === 'isNull')) {
        queryBuilder.andWhere(`ticket.${key} IS NULL`);
      } else {
        queryBuilder.andWhere(`ticket.${key} = :${key}`, { [key]: where[key] });
      }
    });

    // Search filter
    if (filters.search) {
      queryBuilder.andWhere(
        '(ticket.title ILIKE :search OR ticket.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('ticket.tags && :tags', { tags: filters.tags });
    }

    // Rating filters
    if (filters.minRating !== undefined) {
      queryBuilder.andWhere('ticket.customerSatisfactionRating >= :minRating', { minRating: filters.minRating });
    }
    if (filters.maxRating !== undefined) {
      queryBuilder.andWhere('ticket.customerSatisfactionRating <= :maxRating', { maxRating: filters.maxRating });
    }

    // Overdue filter
    if (filters.isOverdue) {
      queryBuilder.andWhere('ticket.dueDate < :now AND ticket.status NOT IN (:...closedStatuses)', {
        now: new Date(),
        closedStatuses: [TicketStatus.CLOSED, TicketStatus.RESOLVED],
      });
    }

    // Has attachments filter
    if (filters.hasAttachments) {
      queryBuilder.andWhere('EXISTS (SELECT 1 FROM ticket_attachments ta WHERE ta.ticket_id = ticket.id)');
    }

    // Apply sorting and pagination
    queryBuilder
      .orderBy(`ticket.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [tickets, total] = await queryBuilder.getManyAndCount();
    const analytics = await this.getAnalytics(filters);

    return {
      tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      analytics,
    };
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['attachments'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async findByUserId(userId: string, query?: Partial<TicketQueryDto>): Promise<Ticket[]> {
    const where: any = { userId };
    
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;
    if (query?.category) where.category = query.category;

    return await this.ticketRepository.find({
      where,
      relations: ['attachments'],
      order: { createdAt: 'DESC' },
      take: query?.limit || 50,
    });
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId?: string): Promise<Ticket> {
    const ticket = await this.findOne(id);

    // Check if user can update this ticket
    if (userId && ticket.userId !== userId && !updateTicketDto.assignedTo) {
      throw new ForbiddenException('You can only update your own tickets');
    }

    // Handle status changes
    if (updateTicketDto.status) {
      if (updateTicketDto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        updateTicketDto.resolvedAt = new Date().toISOString();
        updateTicketDto.resolvedBy = userId || updateTicketDto.assignedTo;
        if (ticket.createdAt) {
          updateTicketDto.actualResolutionTime = Math.floor(
            (new Date().getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60)
          );
        }
      }
      
      if (updateTicketDto.status === TicketStatus.CLOSED && !ticket.closedAt) {
        updateTicketDto.closedAt = new Date().toISOString();
        updateTicketDto.closedBy = userId || updateTicketDto.assignedTo;
      }
    }

    // Set first response time
    if (!ticket.firstResponseAt && updateTicketDto.resolution) {
      updateTicketDto.firstResponseAt = new Date().toISOString();
    }

    // Update last activity
    updateTicketDto.lastActivityAt = new Date().toISOString();

    // Merge existing metadata with new metadata
    if (updateTicketDto.metadata && ticket.metadata) {
      updateTicketDto.metadata = {
        ...ticket.metadata,
        ...updateTicketDto.metadata,
        updated_at: new Date().toISOString(),
      };
    }

    Object.assign(ticket, {
      ...updateTicketDto,
      resolvedAt: updateTicketDto.resolvedAt ? new Date(updateTicketDto.resolvedAt) : ticket.resolvedAt,
      closedAt: updateTicketDto.closedAt ? new Date(updateTicketDto.closedAt) : ticket.closedAt,
      firstResponseAt: updateTicketDto.firstResponseAt ? new Date(updateTicketDto.firstResponseAt) : ticket.firstResponseAt,
      lastActivityAt: updateTicketDto.lastActivityAt ? new Date(updateTicketDto.lastActivityAt) : ticket.lastActivityAt,
    });

    const updatedTicket = await this.ticketRepository.save(ticket);
    this.logger.log(`Updated ticket: ${id}`);
    
    return updatedTicket;
  }

  async remove(id: string, userId?: string): Promise<void> {
    const ticket = await this.findOne(id);

    // Check if user can delete this ticket
    if (userId && ticket.userId !== userId) {
      throw new ForbiddenException('You can only delete your own tickets');
    }

    // Delete associated attachments from filesystem
    if (ticket.attachments && ticket.attachments.length > 0) {
      for (const attachment of ticket.attachments) {
        try {
          if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
          }
        } catch (error) {
          this.logger.warn(`Failed to delete attachment file: ${attachment.filePath}`);
        }
      }
    }

    await this.ticketRepository.remove(ticket);
    this.logger.log(`Deleted ticket: ${id}`);
  }

  async uploadAttachment(
    ticketId: string,
    file: Express.Multer.File,
    uploadDto: UploadAttachmentDto,
    userId: string,
  ): Promise<TicketAttachment> {
    const ticket = await this.findOne(ticketId);

    // Check if user can upload to this ticket
    if (ticket.userId !== userId && ticket.assignedTo !== userId) {
      throw new ForbiddenException('You can only upload attachments to your own tickets or assigned tickets');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const attachment = this.attachmentRepository.create({
      ticketId,
      originalName: file.originalname,
      fileName,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileExtension: fileExtension.substring(1),
      uploadedBy: userId,
      description: uploadDto.description,
      isPublic: uploadDto.isPublic || false,
      uploadSource: uploadDto.uploadSource || 'web',
      metadata: {
        uploaded_at: new Date().toISOString(),
        original_size: file.size,
      },
    });

    const savedAttachment = await this.attachmentRepository.save(attachment);
    this.logger.log(`Uploaded attachment: ${savedAttachment.id} for ticket: ${ticketId}`);

    return savedAttachment;
  }

  async getAttachment(ticketId: string, attachmentId: string): Promise<TicketAttachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, ticketId },
      relations: ['ticket'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
    }

    return attachment;
  }

  async downloadAttachment(ticketId: string, attachmentId: string, userId?: string): Promise<{
    attachment: TicketAttachment;
    fileBuffer: Buffer;
  }> {
    const attachment = await this.getAttachment(ticketId, attachmentId);

    // Check permissions
    if (userId && !attachment.isPublic) {
      if (attachment.ticket.userId !== userId && attachment.ticket.assignedTo !== userId) {
        throw new ForbiddenException('You do not have permission to download this attachment');
      }
    }

    if (!fs.existsSync(attachment.filePath)) {
      throw new NotFoundException('Attachment file not found on disk');
    }

    const fileBuffer = fs.readFileSync(attachment.filePath);

    // Update download count
    attachment.downloadCount += 1;
    await this.attachmentRepository.save(attachment);

    return { attachment, fileBuffer };
  }

  async deleteAttachment(ticketId: string, attachmentId: string, userId: string): Promise<void> {
    const attachment = await this.getAttachment(ticketId, attachmentId);

    // Check permissions
    if (attachment.uploadedBy !== userId && attachment.ticket.assignedTo !== userId) {
      throw new ForbiddenException('You can only delete your own attachments');
    }

    // Delete file from disk
    if (fs.existsSync(attachment.filePath)) {
      fs.unlinkSync(attachment.filePath);
    }

    await this.attachmentRepository.remove(attachment);
    this.logger.log(`Deleted attachment: ${attachmentId}`);
  }

  async getAnalytics(filters?: Partial<TicketQueryDto>): Promise<any> {
    const baseQuery = this.ticketRepository.createQueryBuilder('ticket');

    // Apply filters to analytics query
    if (filters?.userId) baseQuery.andWhere('ticket.userId = :userId', { userId: filters.userId });
    if (filters?.assignedTo) baseQuery.andWhere('ticket.assignedTo = :assignedTo', { assignedTo: filters.assignedTo });
    if (filters?.category) baseQuery.andWhere('ticket.category = :category', { category: filters.category });
    if (filters?.fromDate) baseQuery.andWhere('ticket.createdAt >= :fromDate', { fromDate: filters.fromDate });
    if (filters?.toDate) baseQuery.andWhere('ticket.createdAt <= :toDate', { toDate: filters.toDate });

    const [
      totalTickets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      ticketsBySource,
      avgResolutionTime,
      avgFirstResponseTime,
      overdueTickets,
      unassignedTickets,
    ] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.select('ticket.status, COUNT(*) as count').groupBy('ticket.status').getRawMany(),
      baseQuery.select('ticket.priority, COUNT(*) as count').groupBy('ticket.priority').getRawMany(),
      baseQuery.select('ticket.category, COUNT(*) as count').groupBy('ticket.category').getRawMany(),
      baseQuery.select('ticket.source, COUNT(*) as count').groupBy('ticket.source').getRawMany(),
      baseQuery.select('AVG(ticket.actualResolutionTime)').where('ticket.actualResolutionTime IS NOT NULL').getRawOne(),
      baseQuery.select('AVG(EXTRACT(EPOCH FROM (ticket.firstResponseAt - ticket.createdAt))/3600)').where('ticket.firstResponseAt IS NOT NULL').getRawOne(),
      baseQuery.where('ticket.dueDate < :now AND ticket.status NOT IN (:...closedStatuses)', {
        now: new Date(),
        closedStatuses: [TicketStatus.CLOSED, TicketStatus.RESOLVED],
      }).getCount(),
      baseQuery.where('ticket.assignedTo IS NULL AND ticket.status NOT IN (:...closedStatuses)', {
        closedStatuses: [TicketStatus.CLOSED, TicketStatus.RESOLVED],
      }).getCount(),
    ]);

    return {
      totalTickets,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item.ticket_status] = parseInt(item.count);
        return acc;
      }, {}),
      ticketsByPriority: ticketsByPriority.reduce((acc, item) => {
        acc[item.ticket_priority] = parseInt(item.count);
        return acc;
      }, {}),
      ticketsByCategory: ticketsByCategory.reduce((acc, item) => {
        acc[item.ticket_category] = parseInt(item.count);
        return acc;
      }, {}),
      ticketsBySource: ticketsBySource.reduce((acc, item) => {
        acc[item.ticket_source] = parseInt(item.count);
        return acc;
      }, {}),
      averageResolutionTime: avgResolutionTime?.avg ? parseFloat(avgResolutionTime.avg).toFixed(2) : 0,
      averageFirstResponseTime: avgFirstResponseTime?.avg ? parseFloat(avgFirstResponseTime.avg).toFixed(2) : 0,
      overdueTickets,
      unassignedTickets,
      resolutionRate: totalTickets > 0 ? ((totalTickets - overdueTickets) / totalTickets * 100).toFixed(2) : 0,
    };
  }

  // Cron job to check for overdue tickets (runs every hour)
  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueTickets(): Promise<void> {
    try {
      const overdueTickets = await this.ticketRepository.find({
        where: {
          dueDate: LessThanOrEqual(new Date()),
          status: Not(In([TicketStatus.CLOSED, TicketStatus.RESOLVED])),
        },
      });

      for (const ticket of overdueTickets) {
        // Update metadata to mark as overdue
        ticket.metadata = {
          ...ticket.metadata,
          is_overdue: true,
          overdue_since: new Date().toISOString(),
        };
        
        await this.ticketRepository.save(ticket);
        this.logger.warn(`Ticket ${ticket.id} is overdue`);
      }

      if (overdueTickets.length > 0) {
        this.logger.log(`Found ${overdueTickets.length} overdue tickets`);
      }
    } catch (error) {
      this.logger.error(`Failed to check overdue tickets: ${error.message}`, error.stack);
    }
  }

  // Cron job to auto-close resolved tickets after 7 days (runs daily)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoCloseResolvedTickets(): Promise<void> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const ticketsToClose = await this.ticketRepository.find({
        where: {
          status: TicketStatus.RESOLVED,
          resolvedAt: LessThanOrEqual(sevenDaysAgo),
        },
      });

      for (const ticket of ticketsToClose) {
        ticket.status = TicketStatus.CLOSED;
        ticket.closedAt = new Date();
        ticket.closedBy = 'system';
        ticket.metadata = {
          ...ticket.metadata,
          auto_closed: true,
          auto_closed_at: new Date().toISOString(),
        };
        
        await this.ticketRepository.save(ticket);
      }

      if (ticketsToClose.length > 0) {
        this.logger.log(`Auto-closed ${ticketsToClose.length} resolved tickets`);
      }
    } catch (error) {
      this.logger.error(`Failed to auto-close resolved tickets: ${error.message}`, error.stack);
    }
  }
}
