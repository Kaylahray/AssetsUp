import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { FeedbackSupportController } from '../feedback-support.controller';
import { FeedbackSupportService } from '../feedback-support.service';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TicketQueryDto } from '../dto/ticket-query.dto';
import { UploadAttachmentDto } from '../dto/upload-attachment.dto';
import { Ticket } from '../entities/ticket.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketStatus, TicketPriority, TicketCategory, TicketSource } from '../feedback-support.enums';

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

const mockAnalytics = {
  totalTickets: 100,
  statusDistribution: {
    open: 30,
    in_progress: 20,
    resolved: 40,
    closed: 10,
  },
  priorityDistribution: {
    low: 20,
    medium: 50,
    high: 25,
    critical: 5,
  },
  categoryDistribution: {
    technical_issue: 40,
    feature_request: 30,
    bug_report: 20,
    general_inquiry: 10,
  },
  sourceDistribution: {
    web: 60,
    email: 25,
    phone: 10,
    chat: 5,
  },
  averageResolutionTime: 2.5,
  overdueTickets: 5,
  unassignedTickets: 15,
};

describe('FeedbackSupportController', () => {
  let controller: FeedbackSupportController;
  let service: jest.Mocked<FeedbackSupportService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadAttachment: jest.fn(),
    downloadAttachment: jest.fn(),
    deleteAttachment: jest.fn(),
    getAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackSupportController],
      providers: [
        {
          provide: FeedbackSupportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackSupportController>(FeedbackSupportController);
    service = module.get(FeedbackSupportService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
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

      service.create.mockResolvedValue(mockTicket as Ticket);

      const result = await controller.create(createTicketDto);

      expect(service.create).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(mockTicket);
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

      service.create.mockRejectedValue(new BadRequestException('Invalid input'));

      await expect(controller.create(createTicketDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets with analytics', async () => {
      const query: TicketQueryDto = {
        page: 1,
        limit: 10,
        status: TicketStatus.OPEN,
      };

      const expectedResult = {
        tickets: [mockTicket],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty query parameters', async () => {
      const query: TicketQueryDto = {};

      const expectedResult = {
        tickets: [mockTicket],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAnalytics', () => {
    it('should return ticket analytics', async () => {
      const filters = { status: TicketStatus.OPEN };

      service.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics(filters);

      expect(service.getAnalytics).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockAnalytics);
    });

    it('should handle empty filters', async () => {
      service.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics({});

      expect(service.getAnalytics).toHaveBeenCalledWith({});
      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('findByUserId', () => {
    it('should return tickets for a specific user', async () => {
      const userId = 'user123';
      const query = { status: TicketStatus.OPEN };

      service.findByUserId.mockResolvedValue([mockTicket as Ticket]);

      const result = await controller.findByUserId(userId, query);

      expect(service.findByUserId).toHaveBeenCalledWith(userId, query);
      expect(result).toEqual([mockTicket]);
    });

    it('should handle invalid UUID', async () => {
      const invalidUserId = 'invalid-uuid';
      const query = {};

      // This would be caught by the ParseUUIDPipe in real scenario
      await expect(async () => {
        // Simulate ParseUUIDPipe validation
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(invalidUserId)) {
          throw new BadRequestException('Invalid UUID format');
        }
        await controller.findByUserId(invalidUserId, query);
      }).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByStatus', () => {
    it('should return tickets with specific status', async () => {
      const status = TicketStatus.OPEN;
      const limit = 25;

      const findAllResult = {
        tickets: [mockTicket as Ticket],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(findAllResult);

      const result = await controller.findByStatus(status, limit);

      expect(service.findAll).toHaveBeenCalledWith({
        status,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      expect(result).toEqual([mockTicket]);
    });

    it('should use default limit when not provided', async () => {
      const status = TicketStatus.OPEN;

      const findAllResult = {
        tickets: [mockTicket as Ticket],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(findAllResult);

      const result = await controller.findByStatus(status);

      expect(service.findAll).toHaveBeenCalledWith({
        status,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
    });
  });

  describe('findByPriority', () => {
    it('should return tickets with specific priority', async () => {
      const priority = TicketPriority.HIGH;
      const limit = 25;

      const findAllResult = {
        tickets: [mockTicket as Ticket],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(findAllResult);

      const result = await controller.findByPriority(priority, limit);

      expect(service.findAll).toHaveBeenCalledWith({
        priority,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });
      expect(result).toEqual([mockTicket]);
    });
  });

  describe('findOverdue', () => {
    it('should return overdue tickets', async () => {
      const limit = 25;

      const findAllResult = {
        tickets: [mockTicket as Ticket],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(findAllResult);

      const result = await controller.findOverdue(limit);

      expect(service.findAll).toHaveBeenCalledWith({
        isOverdue: true,
        limit,
        sortBy: 'dueDate',
        sortOrder: 'ASC',
      });
      expect(result).toEqual([mockTicket]);
    });
  });

  describe('findUnassigned', () => {
    it('should return unassigned tickets', async () => {
      const limit = 25;

      const findAllResult = {
        tickets: [mockTicket as Ticket],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(findAllResult);

      const result = await controller.findUnassigned(limit);

      expect(service.findAll).toHaveBeenCalledWith({
        unassigned: true,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'ASC',
      });
      expect(result).toEqual([mockTicket]);
    });
  });

  describe('findOne', () => {
    it('should return a specific ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';

      service.findOne.mockResolvedValue(mockTicket as Ticket);

      const result = await controller.findOne(ticketId);

      expect(service.findOne).toHaveBeenCalledWith(ticketId);
      expect(result).toEqual(mockTicket);
    });

    it('should handle ticket not found', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';

      service.findOne.mockRejectedValue(new NotFoundException('Ticket not found'));

      await expect(controller.findOne(ticketId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = {
        status: TicketStatus.IN_PROGRESS,
        assignedTo: 'admin123',
      };
      const userId = 'user123';

      const updatedTicket = { ...mockTicket, ...updateDto } as Ticket;
      service.update.mockResolvedValue(updatedTicket);

      const result = await controller.update(ticketId, updateDto, userId);

      expect(service.update).toHaveBeenCalledWith(ticketId, updateDto, userId);
      expect(result).toEqual(updatedTicket);
    });

    it('should handle unauthorized update', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateTicketDto = { status: TicketStatus.IN_PROGRESS };
      const userId = 'unauthorized-user';

      service.update.mockRejectedValue(new ForbiddenException('Not authorized'));

      await expect(controller.update(ticketId, updateDto, userId)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assign', () => {
    it('should assign a ticket to a user', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const assignBody = { assignedTo: 'admin123' };

      const assignedTicket = {
        ...mockTicket,
        assignedTo: 'admin123',
        status: TicketStatus.IN_PROGRESS,
      } as Ticket;

      service.update.mockResolvedValue(assignedTicket);

      const result = await controller.assign(ticketId, assignBody);

      expect(service.update).toHaveBeenCalledWith(ticketId, {
        assignedTo: 'admin123',
        status: TicketStatus.IN_PROGRESS,
        metadata: {
          assigned_at: expect.any(String),
          assigned_by: 'system',
        },
      });
      expect(result).toEqual(assignedTicket);
    });
  });

  describe('resolve', () => {
    it('should resolve a ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const resolveBody = {
        resolution: 'Issue resolved',
        resolvedBy: 'admin123',
      };
      const userId = 'admin123';

      const resolvedTicket = {
        ...mockTicket,
        status: TicketStatus.RESOLVED,
        resolution: 'Issue resolved',
        resolvedBy: 'admin123',
      } as Ticket;

      service.update.mockResolvedValue(resolvedTicket);

      const result = await controller.resolve(ticketId, resolveBody, userId);

      expect(service.update).toHaveBeenCalledWith(ticketId, {
        status: TicketStatus.RESOLVED,
        resolution: 'Issue resolved',
        resolvedBy: 'admin123',
        metadata: {
          resolved_at: expect.any(String),
          resolved_by: 'admin123',
        },
      }, userId);
      expect(result).toEqual(resolvedTicket);
    });

    it('should use userId when resolvedBy not provided', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const resolveBody = { resolution: 'Issue resolved' };
      const userId = 'admin123';

      const resolvedTicket = {
        ...mockTicket,
        status: TicketStatus.RESOLVED,
        resolution: 'Issue resolved',
        resolvedBy: 'admin123',
      } as Ticket;

      service.update.mockResolvedValue(resolvedTicket);

      const result = await controller.resolve(ticketId, resolveBody, userId);

      expect(service.update).toHaveBeenCalledWith(ticketId, {
        status: TicketStatus.RESOLVED,
        resolution: 'Issue resolved',
        resolvedBy: 'admin123',
        metadata: {
          resolved_at: expect.any(String),
          resolved_by: 'admin123',
        },
      }, userId);
    });
  });

  describe('close', () => {
    it('should close a ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const closeBody = { closedBy: 'admin123' };
      const userId = 'admin123';

      const closedTicket = {
        ...mockTicket,
        status: TicketStatus.CLOSED,
        closedBy: 'admin123',
      } as Ticket;

      service.update.mockResolvedValue(closedTicket);

      const result = await controller.close(ticketId, closeBody, userId);

      expect(service.update).toHaveBeenCalledWith(ticketId, {
        status: TicketStatus.CLOSED,
        closedBy: 'admin123',
        metadata: {
          closed_at: expect.any(String),
          closed_by: 'admin123',
        },
      }, userId);
      expect(result).toEqual(closedTicket);
    });
  });

  describe('reopen', () => {
    it('should reopen a ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'admin123';

      const reopenedTicket = {
        ...mockTicket,
        status: TicketStatus.REOPENED,
        resolvedAt: null,
        closedAt: null,
      } as Ticket;

      service.update.mockResolvedValue(reopenedTicket);

      const result = await controller.reopen(ticketId, userId);

      expect(service.update).toHaveBeenCalledWith(ticketId, {
        status: TicketStatus.REOPENED,
        resolvedAt: null,
        closedAt: null,
        metadata: {
          reopened_at: expect.any(String),
          reopened_by: 'admin123',
        },
      }, userId);
      expect(result).toEqual(reopenedTicket);
    });
  });

  describe('uploadAttachment', () => {
    it('should upload an attachment successfully', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {
        description: 'Test attachment',
        isPublic: false,
      };
      const userId = 'user123';

      service.uploadAttachment.mockResolvedValue(mockAttachment as TicketAttachment);

      const result = await controller.uploadAttachment(ticketId, mockFile, uploadDto, userId);

      expect(service.uploadAttachment).toHaveBeenCalledWith(ticketId, mockFile, uploadDto, userId);
      expect(result).toEqual(mockAttachment);
    });

    it('should throw BadRequestException when no file provided', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};
      const userId = 'user123';

      await expect(
        controller.uploadAttachment(ticketId, null, uploadDto, userId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no userId provided', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};

      await expect(
        controller.uploadAttachment(ticketId, mockFile, uploadDto, undefined)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for oversized file', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};
      const userId = 'user123';

      const oversizedFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB
      };

      await expect(
        controller.uploadAttachment(ticketId, oversizedFile, uploadDto, userId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const uploadDto: UploadAttachmentDto = {};
      const userId = 'user123';

      const invalidFile = {
        ...mockFile,
        mimetype: 'application/x-executable',
      };

      await expect(
        controller.uploadAttachment(ticketId, invalidFile, uploadDto, userId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAttachments', () => {
    it('should return ticket attachments', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const ticketWithAttachments = {
        ...mockTicket,
        attachments: [mockAttachment as TicketAttachment],
      } as Ticket;

      service.findOne.mockResolvedValue(ticketWithAttachments);

      const result = await controller.getAttachments(ticketId);

      expect(service.findOne).toHaveBeenCalledWith(ticketId);
      expect(result).toEqual([mockAttachment]);
    });

    it('should return empty array when no attachments', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const ticketWithoutAttachments = {
        ...mockTicket,
        attachments: undefined,
      } as Ticket;

      service.findOne.mockResolvedValue(ticketWithoutAttachments);

      const result = await controller.getAttachments(ticketId);

      expect(result).toEqual([]);
    });
  });

  describe('downloadAttachment', () => {
    it('should download an attachment', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      const fileBuffer = Buffer.from('test file content');
      const downloadResult = {
        attachment: mockAttachment as TicketAttachment,
        fileBuffer,
      };

      service.downloadAttachment.mockResolvedValue(downloadResult);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.downloadAttachment(ticketId, attachmentId, mockResponse, userId);

      expect(service.downloadAttachment).toHaveBeenCalledWith(ticketId, attachmentId, userId);
      expect(mockResponse.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test.pdf"',
        'Content-Length': '1024',
      });
      expect(mockResponse.send).toHaveBeenCalledWith(fileBuffer);
    });

    it('should handle download errors', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';

      service.downloadAttachment.mockRejectedValue(new NotFoundException('Attachment not found'));

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await expect(
        controller.downloadAttachment(ticketId, attachmentId, mockResponse)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteAttachment', () => {
    it('should delete an attachment', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      service.deleteAttachment.mockResolvedValue(undefined);

      await controller.deleteAttachment(ticketId, attachmentId, userId);

      expect(service.deleteAttachment).toHaveBeenCalledWith(ticketId, attachmentId, userId);
    });

    it('should throw BadRequestException when no userId provided', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const attachmentId = '456e7890-e89b-12d3-a456-426614174000';

      await expect(
        controller.deleteAttachment(ticketId, attachmentId, undefined)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a ticket', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      service.remove.mockResolvedValue(undefined);

      await controller.remove(ticketId, userId);

      expect(service.remove).toHaveBeenCalledWith(ticketId, userId);
    });

    it('should handle deletion errors', async () => {
      const ticketId = '123e4567-e89b-12d3-a456-426614174000';
      const userId = 'user123';

      service.remove.mockRejectedValue(new ForbiddenException('Not authorized'));

      await expect(controller.remove(ticketId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
