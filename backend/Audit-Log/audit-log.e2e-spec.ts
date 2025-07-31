import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuditLogModule } from './audit-log.module';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

describe('AuditLogController (e2e)', () => {
  let app: INestApplication;
  let auditLogRepository: Repository<AuditLog>;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [AuditLog, User],
          synchronize: true,
        }),
        EventEmitterModule.forRoot(),
        AuditLogModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    auditLogRepository = moduleFixture.get<Repository<AuditLog>>(
      getRepositoryToken(AuditLog),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test user
    testUser = userRepository.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(testUser);

    // Generate auth token
    authToken = jwtService.sign({
      email: testUser.email,
      sub: testUser.id,
      role: testUser.role,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up audit logs before each test
    await auditLogRepository.clear();
  });

  describe('/audit-logs (POST)', () => {
    it('should create a new audit log entry', () => {
      const createDto = {
        actorId: testUser.id,
        actorName: testUser.email,
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        resourceId: 'asset-123',
        description: 'Created new asset',
        details: { name: 'Test Asset' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        success: true,
      };

      return request(app.getHttpServer())
        .post('/audit-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.actorId).toBe(createDto.actorId);
          expect(res.body.action).toBe(createDto.action);
          expect(res.body.resource).toBe(createDto.resource);
          expect(res.body.description).toBe(createDto.description);
          expect(res.body.success).toBe(true);
        });
    });

    it('should require admin role', () => {
      // Create a non-admin user token
      const nonAdminToken = jwtService.sign({
        email: 'user@example.com',
        sub: 'user-456',
        role: UserRole.EMPLOYEE,
      });

      const createDto = {
        actorId: 'user-456',
        actorName: 'user@example.com',
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
      };

      return request(app.getHttpServer())
        .post('/audit-logs')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send(createDto)
        .expect(403);
    });

    it('should require authentication', () => {
      const createDto = {
        actorId: testUser.id,
        actorName: testUser.email,
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'Created asset',
      };

      return request(app.getHttpServer())
        .post('/audit-logs')
        .send(createDto)
        .expect(401);
    });
  });

  describe('/audit-logs (GET)', () => {
    beforeEach(async () => {
      // Create test audit logs
      const auditLogs = [
        {
          actorId: testUser.id,
          actorName: testUser.email,
          action: AuditAction.CREATE,
          resource: AuditResource.ASSET,
          resourceId: 'asset-1',
          description: 'Created asset 1',
          success: true,
          timestamp: new Date('2024-01-01T10:00:00Z'),
        },
        {
          actorId: testUser.id,
          actorName: testUser.email,
          action: AuditAction.UPDATE,
          resource: AuditResource.ASSET,
          resourceId: 'asset-1',
          description: 'Updated asset 1',
          success: true,
          timestamp: new Date('2024-01-01T11:00:00Z'),
        },
        {
          actorId: 'user-456',
          actorName: 'other@example.com',
          action: AuditAction.DELETE,
          resource: AuditResource.USER,
          resourceId: 'user-789',
          description: 'Deleted user',
          success: false,
          errorMessage: 'Permission denied',
          timestamp: new Date('2024-01-01T12:00:00Z'),
        },
      ];

      for (const logData of auditLogs) {
        const auditLog = auditLogRepository.create(logData);
        await auditLogRepository.save(auditLog);
      }
    });

    it('should return paginated audit logs', () => {
      return request(app.getHttpServer())
        .get('/audit-logs?limit=2&offset=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.meta).toEqual({
            total: 3,
            limit: 2,
            offset: 0,
            page: 1,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false,
          });
        });
    });

    it('should filter by actor ID', () => {
      return request(app.getHttpServer())
        .get(`/audit-logs?actorId=${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data.every((log: any) => log.actorId === testUser.id)).toBe(true);
        });
    });

    it('should filter by action', () => {
      return request(app.getHttpServer())
        .get(`/audit-logs?action=${AuditAction.CREATE}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].action).toBe(AuditAction.CREATE);
        });
    });

    it('should filter by resource', () => {
      return request(app.getHttpServer())
        .get(`/audit-logs?resource=${AuditResource.ASSET}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data.every((log: any) => log.resource === AuditResource.ASSET)).toBe(true);
        });
    });

    it('should filter by success status', () => {
      return request(app.getHttpServer())
        .get('/audit-logs?success=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].success).toBe(false);
        });
    });

    it('should filter by date range', () => {
      return request(app.getHttpServer())
        .get('/audit-logs?fromDate=2024-01-01T10:30:00Z&toDate=2024-01-01T11:30:00Z')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].action).toBe(AuditAction.UPDATE);
        });
    });

    it('should sort by timestamp descending by default', () => {
      return request(app.getHttpServer())
        .get('/audit-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(3);
          expect(new Date(res.body.data[0].timestamp).getTime())
            .toBeGreaterThan(new Date(res.body.data[1].timestamp).getTime());
        });
    });
  });

  describe('/audit-logs/stats (GET)', () => {
    beforeEach(async () => {
      // Create test data for statistics
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const auditLogs = [
        // Recent logs
        {
          actorId: testUser.id,
          actorName: testUser.email,
          action: AuditAction.CREATE,
          resource: AuditResource.ASSET,
          description: 'Recent create',
          success: true,
          timestamp: now,
        },
        {
          actorId: testUser.id,
          actorName: testUser.email,
          action: AuditAction.UPDATE,
          resource: AuditResource.ASSET,
          description: 'Recent update',
          success: false,
          timestamp: yesterday,
        },
        // Older logs
        {
          actorId: 'user-456',
          actorName: 'other@example.com',
          action: AuditAction.DELETE,
          resource: AuditResource.USER,
          description: 'Old delete',
          success: true,
          timestamp: lastWeek,
        },
      ];

      for (const logData of auditLogs) {
        const auditLog = auditLogRepository.create(logData);
        await auditLogRepository.save(auditLog);
      }
    });

    it('should return audit log statistics', () => {
      return request(app.getHttpServer())
        .get('/audit-logs/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalLogs');
          expect(res.body).toHaveProperty('logsLast24Hours');
          expect(res.body).toHaveProperty('logsLast7Days');
          expect(res.body).toHaveProperty('failedActions');
          expect(res.body).toHaveProperty('mostActiveUsers');
          expect(res.body).toHaveProperty('mostCommonActions');
          expect(res.body).toHaveProperty('mostAccessedResources');
          expect(res.body.totalLogs).toBe(3);
          expect(res.body.failedActions).toBe(1);
        });
    });
  });

  describe('/audit-logs/resource/:resource/:resourceId (GET)', () => {
    beforeEach(async () => {
      const auditLog = auditLogRepository.create({
        actorId: testUser.id,
        actorName: testUser.email,
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        resourceId: 'asset-123',
        description: 'Created asset',
        success: true,
      });
      await auditLogRepository.save(auditLog);
    });

    it('should return audit logs for a specific resource', () => {
      return request(app.getHttpServer())
        .get(`/audit-logs/resource/${AuditResource.ASSET}/asset-123`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].resource).toBe(AuditResource.ASSET);
          expect(res.body[0].resourceId).toBe('asset-123');
        });
    });
  });

  describe('/audit-logs/my-logs (GET)', () => {
    beforeEach(async () => {
      const auditLog = auditLogRepository.create({
        actorId: testUser.id,
        actorName: testUser.email,
        action: AuditAction.CREATE,
        resource: AuditResource.ASSET,
        description: 'My action',
        success: true,
      });
      await auditLogRepository.save(auditLog);
    });

    it('should return audit logs for the current user', () => {
      return request(app.getHttpServer())
        .get('/audit-logs/my-logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].actorId).toBe(testUser.id);
        });
    });
  });
});
