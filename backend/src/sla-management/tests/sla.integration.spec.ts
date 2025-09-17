import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { SLAModule } from '../sla.module';
import { SLARecord } from '../entities/sla-record.entity';
import { SLABreach } from '../entities/sla-breach.entity';
import { SLAStatus, SLAPriority, AssetCategory, SLABreachSeverity } from '../sla.enums';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SLA Management Integration Tests', () => {
  let app: INestApplication;
  let slaRecordRepository: Repository<SLARecord>;
  let slaBreachRepository: Repository<SLABreach>;

  const mockDatabase = {
    type: 'sqlite',
    database: ':memory:',
    entities: [SLARecord, SLABreach],
    synchronize: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(mockDatabase as any),
        SLAModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    slaRecordRepository = moduleFixture.get<Repository<SLARecord>>(getRepositoryToken(SLARecord));
    slaBreachRepository = moduleFixture.get<Repository<SLABreach>>(getRepositoryToken(SLABreach));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await slaBreachRepository.clear();
    await slaRecordRepository.clear();
  });

  describe('POST /sla', () => {
    it('should create a new SLA record', async () => {
      const createDto = {
        vendorId: 'vendor-123',
        serviceDescription: 'Hardware maintenance service',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
        priority: SLAPriority.MEDIUM,
        responseTimeHours: 24,
        resolutionTimeHours: 72,
        uptimePercentage: 99.9,
      };

      const response = await request(app.getHttpServer())
        .post('/sla')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        vendorId: createDto.vendorId,
        serviceDescription: createDto.serviceDescription,
        assetCategory: createDto.assetCategory,
        breachPolicy: createDto.breachPolicy,
        status: SLAStatus.ACTIVE,
        priority: createDto.priority,
      });
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 when start date is after end date', async () => {
      const createDto = {
        vendorId: 'vendor-123',
        serviceDescription: 'Hardware maintenance service',
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
      };

      await request(app.getHttpServer())
        .post('/sla')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /sla', () => {
    let slaRecord: SLARecord;

    beforeEach(async () => {
      slaRecord = await slaRecordRepository.save({
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
      });
    });

    it('should return paginated SLA records', async () => {
      const response = await request(app.getHttpServer())
        .get('/sla')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: slaRecord.id,
            vendorId: slaRecord.vendorId,
          }),
        ]),
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should filter by vendor ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/sla')
        .query({ vendorId: 'vendor-123' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].vendorId).toBe('vendor-123');
    });

    it('should filter by asset category', async () => {
      const response = await request(app.getHttpServer())
        .get('/sla')
        .query({ assetCategory: AssetCategory.HARDWARE })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].assetCategory).toBe(AssetCategory.HARDWARE);
    });
  });

  describe('GET /sla/:id', () => {
    let slaRecord: SLARecord;

    beforeEach(async () => {
      slaRecord = await slaRecordRepository.save({
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
      });
    });

    it('should return a specific SLA record', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sla/${slaRecord.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: slaRecord.id,
        vendorId: slaRecord.vendorId,
        serviceDescription: slaRecord.serviceDescription,
      });
    });

    it('should return 404 for non-existent SLA record', async () => {
      await request(app.getHttpServer())
        .get('/sla/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /sla/:id', () => {
    let slaRecord: SLARecord;

    beforeEach(async () => {
      slaRecord = await slaRecordRepository.save({
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
      });
    });

    it('should update an SLA record', async () => {
      const updateDto = {
        serviceDescription: 'Updated service description',
        status: SLAStatus.SUSPENDED,
      };

      const response = await request(app.getHttpServer())
        .patch(`/sla/${slaRecord.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: slaRecord.id,
        serviceDescription: updateDto.serviceDescription,
        status: updateDto.status,
      });
    });
  });

  describe('DELETE /sla/:id', () => {
    let slaRecord: SLARecord;

    beforeEach(async () => {
      slaRecord = await slaRecordRepository.save({
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
      });
    });

    it('should delete an SLA record', async () => {
      await request(app.getHttpServer())
        .delete(`/sla/${slaRecord.id}`)
        .expect(204);

      const deletedRecord = await slaRecordRepository.findOne({
        where: { id: slaRecord.id },
      });
      expect(deletedRecord).toBeNull();
    });
  });

  describe('GET /sla/expiring', () => {
    beforeEach(async () => {
      // Create an SLA expiring in 15 days
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 15);

      await slaRecordRepository.save({
        vendorId: 'vendor-123',
        serviceDescription: 'Expiring service',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: expiringDate,
        assetCategory: AssetCategory.HARDWARE,
        breachPolicy: 'Standard breach policy',
        status: SLAStatus.ACTIVE,
        priority: SLAPriority.MEDIUM,
        responseTimeHours: 24,
        resolutionTimeHours: 72,
        uptimePercentage: 99.9,
      });
    });

    it('should return expiring SLA records', async () => {
      const response = await request(app.getHttpServer())
        .get('/sla/expiring')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].serviceDescription).toBe('Expiring service');
    });
  });

  describe('SLA Breach Management', () => {
    let slaRecord: SLARecord;

    beforeEach(async () => {
      slaRecord = await slaRecordRepository.save({
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
      });
    });

    describe('POST /sla/breach', () => {
      it('should create a new SLA breach', async () => {
        const createBreachDto = {
          slaRecordId: slaRecord.id,
          description: 'Response time exceeded',
          severity: SLABreachSeverity.MINOR,
          breachTime: new Date().toISOString(),
        };

        const response = await request(app.getHttpServer())
          .post('/sla/breach')
          .send(createBreachDto)
          .expect(201);

        expect(response.body).toMatchObject({
          slaRecordId: slaRecord.id,
          description: createBreachDto.description,
          severity: createBreachDto.severity,
          isResolved: false,
        });
      });
    });

    describe('GET /sla/:id/breaches', () => {
      beforeEach(async () => {
        await slaBreachRepository.save({
          slaRecordId: slaRecord.id,
          description: 'Test breach',
          severity: SLABreachSeverity.MINOR,
          breachTime: new Date(),
          isResolved: false,
        });
      });

      it('should return breaches for a specific SLA record', async () => {
        const response = await request(app.getHttpServer())
          .get(`/sla/${slaRecord.id}/breaches`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
          slaRecordId: slaRecord.id,
          description: 'Test breach',
          severity: SLABreachSeverity.MINOR,
        });
      });
    });

    describe('POST /sla/:id/mock-breach', () => {
      it('should trigger a mock breach', async () => {
        const response = await request(app.getHttpServer())
          .post(`/sla/${slaRecord.id}/mock-breach`)
          .send({ description: 'Mock breach for testing' })
          .expect(201);

        expect(response.body).toMatchObject({
          slaRecordId: slaRecord.id,
          description: 'Mock breach for testing',
          isResolved: false,
        });
      });
    });
  });
});
