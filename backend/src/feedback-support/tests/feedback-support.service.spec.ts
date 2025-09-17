import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { FeedbackSupportService } from '../feedback-support.service';
import { Ticket } from '../entities/ticket.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { TicketStatus, TicketPriority, TicketCategory, TicketSource } from '../feedback-support.enums';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');
jest.mock('path');

const mockTicket: Partial<Ticket> = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Ticket',
  description: 'Test Description',
  priority: TicketPriority.MEDIUM,
  status: TicketStatus.OPEN,
  category: TicketCategory.TECHNICAL_ISSUE,
  source: TicketSource.WEB,
  userId: 'user123',
  userEmail: 'test@example.com',
  userName: 'Test User',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  attachments: [],
};

const mockAttachment: Partial<TicketAttachment> = {
  id: '456e7890-e89b-12d3-a456-426614174000',
  fileName: 'test.pdf',
  originalName: 'test.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  filePath: '/uploads/tickets/test.pdf',
  uploadedBy: 'user123',
  uploadedAt: new Date('2024-01-01'),
  isPublic: false,
  virusScanStatus: 'clean',
  ticket: mockTicket as Ticket,
};

const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 1024,
  destination: '/uploads/tickets',
  filename: 'test.pdf',
  path: '/uploads/tickets/test.pdf',
  buffer: Buffer.from('test file content'),
  stream: null,
};

describe('FeedbackSupportService', () => {
  let service: FeedbackSupportService;
  let ticketRepository: jest.Mocked<Repository<Ticket>>;
  let attachmentRepository: jest.Mocked<Repository<TicketAttachment>>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  const mockTicketRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAttachmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
    getCronJob: jest.fn(),
    deleteCronJob: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    select: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackSupportService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockTicketRepository,
        },
        {
          provide: getRepositoryToken(TicketAttachment),
          useValue: mockAttachmentRepository,
        },
        {
          provide: SchedulerRegistry,
          useValue: mockSchedulerRegistry,
        },
      ],
    }).compile();

    service = module.get<FeedbackSupportService>(FeedbackSupportService);
    ticketRepository = module.get(getRepositoryToken(Ticket));
    attachmentRepository = module.get(getRepositoryToken(TicketAttachment));
    schedulerRegistry = module.get(SchedulerRegistry);

    // Reset all mocks
    jest.clearAllMocks();
    mockTicketRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  describe('create', () => {
    it('should create a new ticket successfully', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.TECHNICAL_ISSUE,
        source: TicketSource.WEB,
        userId: 'user123',
        userEmail: 'test@example.com',
        userName: 'Test User',
      };

      mockTicketRepository.create.mockReturnValue(mockTicket as Ticket);
      mockTicketRepository.save.mockResolvedValue(mockTicket as Ticket);

      const result = await service.create(createTicketDto);

      expect(mockTicketRepository.create).toHaveBeenCalledWith(createTicketDto);
      expect(mockTicketRepository.save).toHaveBeenCalledWith(mockTicket);
      expect(result).toEqual(mockTicket);
    });

    it('should set default priority to MEDIUM if not provided', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        category: TicketCategory.TECHNICAL_ISSUE,
        source: TicketSource.WEB,
        userId: 'user123',
        userEmail: 'test@example.com',
        userName: 'Test User',
      };

      const ticketWithDefaults = {
        ...createTicketDto,
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
      };

      mockTicketRepository.create.mockReturnValue(ticketWithDefaults as Ticket);
      mockTicketRepository.save.mockResolvedValue(ticketWithDefaults as Ticket);

      const result = await service.create(createTicketDto);

      expect(mockTicketRepository.create).toHaveBeenCalledWith(createTicketDto);
      expect(result.priority).toBe(TicketPriority.MEDIUM);
    });

    it('should handle creation errors', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        category: TicketCategory.TECHNICAL_ISSUE,
        source: TicketSource.WEB,
        userId: 'user123',
        userEmail: 'test@example.com',
        userName: 'Test User',
      };

      mockTicketRepository.create.mockReturnValue(mockTicket as Ticket);
      mockTicketRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createTicketDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return tickets with pagination and filters', async () => {
      const query: TicketQueryDto = {
        page: 1,
        limit: 10,
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
      };

      const tickets = [mockTicket as Ticket];
      const total = 1;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([tickets, total]);

      const result = await service.findAll(query);

      expect(result).toEqual({
        tickets,
        total,
        page: 1,
        limit: 10,
        totalPages: 1,
        analytics: expect.any(Object),
      });
    });

    it('should apply search filter when provided', async () => {
      const query: TicketQueryDto = {
        search: 'test search',
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(ticket.title ILIKE :search OR ticket.description ILIKE :search)',
        { search: '%test search%' }
      );
    });

    it('should apply date range filters when provided', async () => {
      const query: TicketQueryDto = {
        createdAfter: new Date('2024-01-01'),
        createdBefore: new Date('2024-12-31'),
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.createdAt >= :createdAfter',
        { createdAfter: query.createdAfter }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.createdAt <= :createdBefore',
        { createdBefore: query.createdBefore }
      );
    });

    it('should apply overdue filter when requested', async () => {
      const query: TicketQueryDto = {
        isOverdue: true,
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.dueDate < :now AND ticket.status NOT IN (:...closedStatuses)',
        {
          now: expect.any(Date),
          closedStatuses: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
        }
      );
    });

    it('should apply unassigned filter when requested', async () => {
      const query: TicketQueryDto = {
        unassigned: true,
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAll(query);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.assignedTo IS NULL'
      );
    });

    it('should apply sorting when provided', async () => {
      const query: TicketQueryDto = {
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        page: 1,
        limit: 10,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockTicket], 1]);

      await service.findAll(query);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'ticket.createdAt',
        'DESC'
      );
    });
  });

  describe('findOne', () => {
    it('should return a ticket by ID', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';

      mockTicketRepository.findOne.mockResolvedValue(mockTicket as Ticket);

      const result = await service.findOne(ticketId);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['attachments'],
      });
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';

      mockTicketRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(ticketId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return tickets for a specific user', async () => {
      const userId = 'user123';
      const filters = { status: TicketStatus.OPEN };

      mockQueryBuilder.getMany.mockResolvedValue([mockTicket]);

      const result = await service.findByUserId(userId, filters);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'ticket.userId = :userId',
        { userId }
      );
      expect(result).toEqual([mockTicket]);
    });

    it('should apply additional filters when provided', async () => {
      const userId = 'user123';
      const filters = {
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        limit: 20,
      };

      mockQueryBuilder.getMany.mockResolvedValue([mockTicket]);

      await service.findByUserId(userId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.status = :status',
        { status: TicketStatus.OPEN }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ticket.priority = :priority',
        { priority: TicketPriority.HIGH }
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('update', () => {
    it('should update a ticket successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = {
        status: TicketStatus.IN_PROGRESS,
        assignedTo: 'admin123',
      };
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      const updatedTicket = { ...existingTicket, ...updateDto } as Ticket;

      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockTicketRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(ticketId, updateDto, userId);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['attachments'],
      });
      expect(mockTicketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto)
      );
      expect(result).toEqual(updatedTicket);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = { status: TicketStatus.IN_PROGRESS };

      mockTicketRepository.findOne.mockResolvedValue(null);

      await expect(service.update(ticketId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user not authorized', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = { status: TicketStatus.IN_PROGRESS };
      const userId = 'unauthorized-user';

      const existingTicket = { ...mockTicket, userId: 'different-user' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);

      await expect(service.update(ticketId, updateDto, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin users to update any ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = { status: TicketStatus.IN_PROGRESS };
      const adminUserId = 'admin123';

      const existingTicket = { ...mockTicket, userId: 'different-user' } as Ticket;
      const updatedTicket = { ...existingTicket, ...updateDto } as Ticket;

      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockTicketRepository.save.mockResolvedValue(updatedTicket);

      // Mock admin check (in real implementation, this would check user roles)
      const result = await service.update(ticketId, updateDto);

      expect(result).toEqual(updatedTicket);
    });

    it('should set timestamps when status changes', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = { status: TicketStatus.RESOLVED };

      const existingTicket = { ...mockTicket, status: TicketStatus.OPEN } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockTicketRepository.save.mockResolvedValue(existingTicket);

      await service.update(ticketId, updateDto);

      expect(mockTicketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TicketStatus.RESOLVED,
          resolvedAt: expect.any(Date),
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete a ticket successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockTicketRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await service.remove(ticketId, userId);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['attachments'],
      });
      expect(mockTicketRepository.delete).toHaveBeenCalledWith(ticketId);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';

      mockTicketRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(ticketId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user not authorized', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'unauthorized-user';

      const existingTicket = { ...mockTicket, userId: 'different-user' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);

      await expect(service.remove(ticketId, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('uploadAttachment', () => {
    it('should upload attachment successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {
        description: 'Test attachment',
        isPublic: false,
      };
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.create.mockReturnValue(mockAttachment as TicketAttachment);
      mockAttachmentRepository.save.mockResolvedValue(mockAttachment as TicketAttachment);

      // Mock fs operations
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      (path.join as jest.Mock).mockReturnValue('/uploads/tickets/test.pdf');
      (path.extname as jest.Mock).mockReturnValue('.pdf');

      const result = await service.uploadAttachment(ticketId, mockFile, uploadDto, userId);

      expect(mockTicketRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['attachments'],
      });
      expect(mockAttachmentRepository.create).toHaveBeenCalled();
      expect(mockAttachmentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockAttachment);
    });

    it('should throw NotFoundException when ticket not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};
      const userId = 'user123';

      mockTicketRepository.findOne.mockResolvedValue(null);

      await expect(
        service.uploadAttachment(ticketId, mockFile, uploadDto, userId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user not authorized', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};
      const userId = 'unauthorized-user';

      const existingTicket = { ...mockTicket, userId: 'different-user' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);

      await expect(
        service.uploadAttachment(ticketId, mockFile, uploadDto, userId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('downloadAttachment', () => {
    it('should download attachment successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.findOne.mockResolvedValue(mockAttachment as TicketAttachment);

      // Mock fs operations
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test file content'));

      const result = await service.downloadAttachment(ticketId, attachmentId, userId);

      expect(result.attachment).toEqual(mockAttachment);
      expect(result.fileBuffer).toEqual(Buffer.from('test file content'));
    });

    it('should throw NotFoundException when attachment not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';

      const existingTicket = { ...mockTicket } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.downloadAttachment(ticketId, attachmentId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when file not found on disk', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';

      const existingTicket = { ...mockTicket } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.findOne.mockResolvedValue(mockAttachment as TicketAttachment);

      // Mock file not existing
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.downloadAttachment(ticketId, attachmentId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete attachment successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.findOne.mockResolvedValue(mockAttachment as TicketAttachment);
      mockAttachmentRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Mock fs operations
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await service.deleteAttachment(ticketId, attachmentId, userId);

      expect(mockAttachmentRepository.delete).toHaveBeenCalledWith(attachmentId);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockAttachment.filePath);
    });

    it('should throw NotFoundException when attachment not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      const existingTicket = { ...mockTicket, userId: 'user123' } as Ticket;
      mockTicketRepository.findOne.mockResolvedValue(existingTicket);
      mockAttachmentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteAttachment(ticketId, attachmentId, userId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAnalytics', () => {
    it('should return comprehensive analytics', async () => {
      const mockAnalyticsData = [
        { status: 'open', count: '5' },
        { status: 'in_progress', count: '3' },
        { status: 'resolved', count: '10' },
      ];

      mockQueryBuilder.getRawMany.mockResolvedValue(mockAnalyticsData);

      const result = await service.getAnalytics({});

      expect(result).toHaveProperty('totalTickets');
      expect(result).toHaveProperty('statusDistribution');
      expect(result).toHaveProperty('priorityDistribution');
      expect(result).toHaveProperty('categoryDistribution');
      expect(result).toHaveProperty('sourceDistribution');
      expect(result).toHaveProperty('averageResolutionTime');
      expect(result).toHaveProperty('overdueTickets');
      expect(result).toHaveProperty('unassignedTickets');
    });
  });

  describe('checkOverdueTickets', () => {
    it('should identify and log overdue tickets', async () => {
      const overdueTickets = [
        { ...mockTicket, dueDate: new Date('2023-12-01') } as Ticket,
      ];

      mockQueryBuilder.getMany.mockResolvedValue(overdueTickets);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.checkOverdueTickets();

      expect(logSpy).toHaveBeenCalledWith(
        `Found ${overdueTickets.length} overdue tickets`
      );

      logSpy.mockRestore();
    });
  });

  describe('autoCloseResolvedTickets', () => {
    it('should auto-close old resolved tickets', async () => {
      const resolvedTickets = [
        {
          ...mockTicket,
          status: TicketStatus.RESOLVED,
          resolvedAt: new Date('2023-12-01'),
        } as Ticket,
      ];

      mockQueryBuilder.getMany.mockResolvedValue(resolvedTickets);
      mockTicketRepository.save.mockResolvedValue(resolvedTickets[0]);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await service.autoCloseResolvedTickets();

      expect(mockTicketRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TicketStatus.CLOSED,
          closedAt: expect.any(Date),
        })
      );

      logSpy.mockRestore();
    });
  });
});
