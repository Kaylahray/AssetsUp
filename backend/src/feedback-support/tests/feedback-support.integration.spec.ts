import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FeedbackSupportModule } from '../feedback-support.module';
import { Ticket } from '../entities/ticket.entity';
import { TicketAttachment } from '../entities/ticket-attachment.entity';
import { TicketStatus, TicketPriority, TicketCategory, TicketSource } from '../feedback-support.enums';
import * as path from 'path';
import * as fs from 'fs';

describe('FeedbackSupportController (Integration)', () => {
  let app: INestApplication;
  let ticketRepository: Repository<Ticket>;
  let attachmentRepository: Repository<TicketAttachment>;

  const testTicketData = {
    title: 'Integration Test Ticket',
    description: 'This is a test ticket for integration testing',
    priority: TicketPriority.MEDIUM,
    category: TicketCategory.TECHNICAL_ISSUE,
    source: TicketSource.WEB,
    userId: 'test-user-123',
    userEmail: 'test@example.com',
    userName: 'Test User',
    userPhone: '+1-555-0123',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    tags: ['integration', 'test'],
    customFields: {
      department: 'IT',
      urgency: 'normal',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Ticket, TicketAttachment],
          synchronize: true,
          logging: false,
        }),
        ScheduleModule.forRoot(),
        FeedbackSupportModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    ticketRepository = moduleFixture.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    attachmentRepository = moduleFixture.get<Repository<TicketAttachment>>(getRepositoryToken(TicketAttachment));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await attachmentRepository.clear();
    await ticketRepository.clear();
  });

  describe('POST /tickets', () => {
    it('should create a new ticket', async () => {
      const response = await request(app.getHttpServer())
        .post('/tickets')
        .send(testTicketData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: testTicketData.title,
        description: testTicketData.description,
        priority: testTicketData.priority,
        category: testTicketData.category,
        source: testTicketData.source,
        userId: testTicketData.userId,
        userEmail: testTicketData.userEmail,
        userName: testTicketData.userName,
        status: TicketStatus.OPEN,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Missing title',
        userId: 'test-user',
      };

      await request(app.getHttpServer())
        .post('/tickets')
        .send(invalidData)
        .expect(400);
    });

    it('should validate enum values', async () => {
      const invalidData = {
        ...testTicketData,
        priority: 'INVALID_PRIORITY',
        category: 'INVALID_CATEGORY',
      };

      await request(app.getHttpServer())
        .post('/tickets')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /tickets', () => {
    let createdTickets: Ticket[];

    beforeEach(async () => {
      // Create test tickets
      const tickets = await Promise.all([
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          title: 'High Priority Ticket',
          priority: TicketPriority.HIGH,
          status: TicketStatus.OPEN,
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          title: 'Low Priority Ticket',
          priority: TicketPriority.LOW,
          status: TicketStatus.IN_PROGRESS,
          assignedTo: 'admin-123',
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          title: 'Resolved Ticket',
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.RESOLVED,
          resolvedAt: new Date(),
          resolution: 'Issue was resolved successfully',
        })),
      ]);
      createdTickets = tickets;
    });

    it('should return all tickets with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('tickets');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('analytics');

      expect(response.body.tickets).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should filter tickets by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ status: TicketStatus.OPEN })
        .expect(200);

      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].status).toBe(TicketStatus.OPEN);
    });

    it('should filter tickets by priority', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ priority: TicketPriority.HIGH })
        .expect(200);

      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].priority).toBe(TicketPriority.HIGH);
    });

    it('should search tickets by title and description', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ search: 'High Priority' })
        .expect(200);

      expect(response.body.tickets).toHaveLength(1);
      expect(response.body.tickets[0].title).toContain('High Priority');
    });

    it('should filter tickets by user ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ userId: testTicketData.userId })
        .expect(200);

      expect(response.body.tickets).toHaveLength(3);
      response.body.tickets.forEach(ticket => {
        expect(ticket.userId).toBe(testTicketData.userId);
      });
    });

    it('should filter unassigned tickets', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ unassigned: true })
        .expect(200);

      expect(response.body.tickets).toHaveLength(2);
      response.body.tickets.forEach(ticket => {
        expect(ticket.assignedTo).toBeNull();
      });
    });

    it('should sort tickets', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets')
        .query({ sortBy: 'priority', sortOrder: 'ASC' })
        .expect(200);

      const priorities = response.body.tickets.map(t => t.priority);
      expect(priorities).toEqual([TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH]);
    });
  });

  describe('GET /tickets/analytics', () => {
    beforeEach(async () => {
      // Create test tickets for analytics
      await Promise.all([
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          priority: TicketPriority.HIGH,
          status: TicketStatus.OPEN,
          category: TicketCategory.BUG_REPORT,
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.IN_PROGRESS,
          category: TicketCategory.FEATURE_REQUEST,
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          priority: TicketPriority.LOW,
          status: TicketStatus.RESOLVED,
          category: TicketCategory.TECHNICAL_ISSUE,
          resolvedAt: new Date(),
        })),
      ]);
    });

    it('should return comprehensive analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets/analytics')
        .expect(200);

      expect(response.body).toHaveProperty('totalTickets');
      expect(response.body).toHaveProperty('statusDistribution');
      expect(response.body).toHaveProperty('priorityDistribution');
      expect(response.body).toHaveProperty('categoryDistribution');
      expect(response.body).toHaveProperty('sourceDistribution');
      expect(response.body).toHaveProperty('averageResolutionTime');
      expect(response.body).toHaveProperty('overdueTickets');
      expect(response.body).toHaveProperty('unassignedTickets');

      expect(response.body.totalTickets).toBe(3);
      expect(response.body.statusDistribution).toHaveProperty('open');
      expect(response.body.statusDistribution).toHaveProperty('in_progress');
      expect(response.body.statusDistribution).toHaveProperty('resolved');
    });
  });

  describe('GET /tickets/user/:userId', () => {
    let userTickets: Ticket[];

    beforeEach(async () => {
      // Create tickets for specific user
      userTickets = await Promise.all([
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          userId: 'specific-user-123',
          title: 'User Specific Ticket 1',
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          userId: 'specific-user-123',
          title: 'User Specific Ticket 2',
          status: TicketStatus.RESOLVED,
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          userId: 'different-user-456',
          title: 'Different User Ticket',
        })),
      ]);
    });

    it('should return tickets for specific user', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets/user/specific-user-123')
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach(ticket => {
        expect(ticket.userId).toBe('specific-user-123');
      });
    });

    it('should filter user tickets by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/tickets/user/specific-user-123')
        .query({ status: TicketStatus.RESOLVED })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe(TicketStatus.RESOLVED);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/tickets/user/invalid-uuid')
        .expect(400);
    });
  });

  describe('GET /tickets/status/:status', () => {
    beforeEach(async () => {
      await Promise.all([
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.OPEN,
          title: 'Open Ticket 1',
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.OPEN,
          title: 'Open Ticket 2',
        })),
        ticketRepository.save(ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.RESOLVED,
          title: 'Resolved Ticket',
        })),
      ]);
    });

    it('should return tickets with specific status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tickets/status/${TicketStatus.OPEN}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach(ticket => {
        expect(ticket.status).toBe(TicketStatus.OPEN);
      });
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tickets/status/${TicketStatus.OPEN}`)
        .query({ limit: 1 })
        .expect(200);

      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /tickets/:id', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create(testTicketData)
      );
    });

    it('should return specific ticket', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tickets/${createdTicket.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdTicket.id);
      expect(response.body.title).toBe(testTicketData.title);
    });

    it('should return 404 for non-existent ticket', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .get(`/tickets/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .get('/tickets/invalid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /tickets/:id', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create(testTicketData)
      );
    });

    it('should update ticket successfully', async () => {
      const updateData = {
        status: TicketStatus.IN_PROGRESS,
        assignedTo: 'admin-123',
        internalNotes: 'Ticket assigned to admin',
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}`)
        .set('user-id', testTicketData.userId)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe(TicketStatus.IN_PROGRESS);
      expect(response.body.assignedTo).toBe('admin-123');
      expect(response.body.internalNotes).toBe('Ticket assigned to admin');
    });

    it('should return 404 for non-existent ticket', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .patch(`/tickets/${nonExistentId}`)
        .send({ status: TicketStatus.IN_PROGRESS })
        .expect(404);
    });

    it('should validate update data', async () => {
      const invalidData = {
        status: 'INVALID_STATUS',
        priority: 'INVALID_PRIORITY',
      };

      await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PATCH /tickets/:id/assign', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create(testTicketData)
      );
    });

    it('should assign ticket to user', async () => {
      const assignData = { assignedTo: 'admin-123' };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}/assign`)
        .send(assignData)
        .expect(200);

      expect(response.body.assignedTo).toBe('admin-123');
      expect(response.body.status).toBe(TicketStatus.IN_PROGRESS);
      expect(response.body.metadata).toHaveProperty('assigned_at');
      expect(response.body.metadata).toHaveProperty('assigned_by');
    });
  });

  describe('PATCH /tickets/:id/resolve', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.IN_PROGRESS,
        })
      );
    });

    it('should resolve ticket', async () => {
      const resolveData = {
        resolution: 'Issue was resolved successfully',
        resolvedBy: 'admin-123',
      };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}/resolve`)
        .set('user-id', 'admin-123')
        .send(resolveData)
        .expect(200);

      expect(response.body.status).toBe(TicketStatus.RESOLVED);
      expect(response.body.resolution).toBe('Issue was resolved successfully');
      expect(response.body.resolvedBy).toBe('admin-123');
      expect(response.body.metadata).toHaveProperty('resolved_at');
    });
  });

  describe('PATCH /tickets/:id/close', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.RESOLVED,
        })
      );
    });

    it('should close ticket', async () => {
      const closeData = { closedBy: 'admin-123' };

      const response = await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}/close`)
        .set('user-id', 'admin-123')
        .send(closeData)
        .expect(200);

      expect(response.body.status).toBe(TicketStatus.CLOSED);
      expect(response.body.closedBy).toBe('admin-123');
      expect(response.body.metadata).toHaveProperty('closed_at');
    });
  });

  describe('PATCH /tickets/:id/reopen', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create({
          ...testTicketData,
          status: TicketStatus.CLOSED,
          resolvedAt: new Date(),
          closedAt: new Date(),
        })
      );
    });

    it('should reopen ticket', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tickets/${createdTicket.id}/reopen`)
        .set('user-id', 'admin-123')
        .expect(200);

      expect(response.body.status).toBe(TicketStatus.REOPENED);
      expect(response.body.resolvedAt).toBeNull();
      expect(response.body.closedAt).toBeNull();
      expect(response.body.metadata).toHaveProperty('reopened_at');
    });
  });

  describe('DELETE /tickets/:id', () => {
    let createdTicket: Ticket;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create(testTicketData)
      );
    });

    it('should delete ticket', async () => {
      await request(app.getHttpServer())
        .delete(`/tickets/${createdTicket.id}`)
        .set('user-id', testTicketData.userId)
        .expect(200);

      // Verify ticket is deleted
      const deletedTicket = await ticketRepository.findOne({
        where: { id: createdTicket.id },
      });
      expect(deletedTicket).toBeNull();
    });

    it('should return 404 for non-existent ticket', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      await request(app.getHttpServer())
        .delete(`/tickets/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('File Upload Endpoints', () => {
    let createdTicket: Ticket;
    let testFilePath: string;

    beforeEach(async () => {
      createdTicket = await ticketRepository.save(
        ticketRepository.create(testTicketData)
      );

      // Create a test file
      testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'This is a test file for attachment upload');
    });

    afterEach(() => {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    describe('POST /tickets/:id/attachments', () => {
      it('should upload attachment successfully', async () => {
        const response = await request(app.getHttpServer())
          .post(`/tickets/${createdTicket.id}/attachments`)
          .set('user-id', testTicketData.userId)
          .attach('file', testFilePath)
          .field('description', 'Test attachment')
          .field('isPublic', 'false')
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.originalName).toBe('test-file.txt');
        expect(response.body.description).toBe('Test attachment');
        expect(response.body.isPublic).toBe(false);
        expect(response.body.uploadedBy).toBe(testTicketData.userId);
      });

      it('should return 400 when no file provided', async () => {
        await request(app.getHttpServer())
          .post(`/tickets/${createdTicket.id}/attachments`)
          .set('user-id', testTicketData.userId)
          .field('description', 'Test attachment')
          .expect(400);
      });

      it('should return 400 when no user ID provided', async () => {
        await request(app.getHttpServer())
          .post(`/tickets/${createdTicket.id}/attachments`)
          .attach('file', testFilePath)
          .expect(400);
      });
    });

    describe('GET /tickets/:id/attachments', () => {
      let attachment: TicketAttachment;

      beforeEach(async () => {
        attachment = await attachmentRepository.save(
          attachmentRepository.create({
            fileName: 'test-file.txt',
            originalName: 'test-file.txt',
            mimeType: 'text/plain',
            fileSize: 100,
            filePath: testFilePath,
            uploadedBy: testTicketData.userId,
            ticket: createdTicket,
            isPublic: true,
            virusScanStatus: 'clean',
          })
        );
      });

      it('should return ticket attachments', async () => {
        const response = await request(app.getHttpServer())
          .get(`/tickets/${createdTicket.id}/attachments`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(attachment.id);
        expect(response.body[0].originalName).toBe('test-file.txt');
      });
    });
  });
});
