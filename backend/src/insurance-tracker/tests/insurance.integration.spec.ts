import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { InsuranceModule } from '../insurance.module';
import { InsurancePolicy } from '../entities/insurance-policy.entity';
import { PolicyDocument } from '../entities/policy-document.entity';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel } from '../insurance.enums';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Insurance Tracker Integration Tests', () => {
  let app: INestApplication;
  let insurancePolicyRepository: Repository<InsurancePolicy>;
  let policyDocumentRepository: Repository<PolicyDocument>;

  const mockDatabase = {
    type: 'sqlite',
    database: ':memory:',
    entities: [InsurancePolicy, PolicyDocument],
    synchronize: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(mockDatabase as any),
        InsuranceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    insurancePolicyRepository = moduleFixture.get<Repository<InsurancePolicy>>(getRepositoryToken(InsurancePolicy));
    policyDocumentRepository = moduleFixture.get<Repository<PolicyDocument>>(getRepositoryToken(PolicyDocument));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await policyDocumentRepository.clear();
    await insurancePolicyRepository.clear();
  });

  describe('POST /insurance', () => {
    it('should create a new insurance policy', async () => {
      const createDto = {
        policyNumber: 'POL-2024-001',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        premiumAmount: 5000,
        paymentFrequency: 'annually',
        deductible: 1000,
        coverageDetails: 'Full comprehensive coverage',
        contactPerson: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john.doe@insurance.com',
        renewalReminderDays: 30,
        notes: 'Important policy for main asset',
      };

      const response = await request(app.getHttpServer())
        .post('/insurance')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        policyNumber: createDto.policyNumber,
        provider: createDto.provider,
        assetId: createDto.assetId,
        insuredValue: createDto.insuredValue,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: createDto.insuranceType,
        coverageLevel: createDto.coverageLevel,
      });
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 when start date is after end date', async () => {
      const createDto = {
        policyNumber: 'POL-2024-002',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-12-31T23:59:59Z',
        coverageEnd: '2024-01-01T00:00:00Z',
        insuredValue: 50000,
      };

      await request(app.getHttpServer())
        .post('/insurance')
        .send(createDto)
        .expect(400);
    });

    it('should return 400 when policy number already exists', async () => {
      const createDto = {
        policyNumber: 'POL-2024-003',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      // Create first policy
      await request(app.getHttpServer())
        .post('/insurance')
        .send(createDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/insurance')
        .send(createDto)
        .expect(400);
    });

    it('should return 400 when neither assetId nor assetCategory is provided', async () => {
      const createDto = {
        policyNumber: 'POL-2024-004',
        provider: 'ABC Insurance Co.',
        coverageStart: '2024-01-01T00:00:00Z',
        coverageEnd: '2024-12-31T23:59:59Z',
        insuredValue: 50000,
      };

      await request(app.getHttpServer())
        .post('/insurance')
        .send(createDto)
        .expect(400);
    });
  });

  describe('GET /insurance', () => {
    let insurancePolicy: InsurancePolicy;

    beforeEach(async () => {
      insurancePolicy = await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-005',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 50000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should return paginated insurance policies with summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance')
        .expect(200);

      expect(response.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: insurancePolicy.id,
            policyNumber: insurancePolicy.policyNumber,
          }),
        ]),
        total: 1,
        page: 1,
        limit: 10,
        summary: expect.objectContaining({
          totalPolicies: 1,
          activePolicies: 1,
          expiredPolicies: 0,
          expiringSoon: 0,
          totalInsuredValue: 50000,
        }),
      });
    });

    it('should filter by asset ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance')
        .query({ assetId: 'asset-123' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].assetId).toBe('asset-123');
    });

    it('should filter by provider', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance')
        .query({ provider: 'ABC Insurance' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].provider).toContain('ABC Insurance');
    });

    it('should filter by insurance type', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance')
        .query({ insuranceType: InsuranceType.COMPREHENSIVE })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].insuranceType).toBe(InsuranceType.COMPREHENSIVE);
    });
  });

  describe('GET /insurance/analytics', () => {
    beforeEach(async () => {
      await insurancePolicyRepository.save([
        {
          policyNumber: 'POL-2024-006',
          provider: 'ABC Insurance Co.',
          assetId: 'asset-123',
          coverageStart: new Date('2024-01-01'),
          coverageEnd: new Date('2024-12-31'),
          insuredValue: 50000,
          status: InsurancePolicyStatus.ACTIVE,
          insuranceType: InsuranceType.COMPREHENSIVE,
          coverageLevel: CoverageLevel.STANDARD,
          renewalReminderDays: 30,
        },
        {
          policyNumber: 'POL-2024-007',
          provider: 'XYZ Insurance Co.',
          assetId: 'asset-456',
          coverageStart: new Date('2024-01-01'),
          coverageEnd: new Date('2023-12-31'), // Expired
          insuredValue: 30000,
          status: InsurancePolicyStatus.EXPIRED,
          insuranceType: InsuranceType.LIABILITY,
          coverageLevel: CoverageLevel.BASIC,
          renewalReminderDays: 30,
        },
      ]);
    });

    it('should return policy analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance/analytics')
        .expect(200);

      expect(response.body).toMatchObject({
        totalPolicies: 2,
        totalInsuredValue: 80000,
        averageInsuredValue: 40000,
        policiesByStatus: expect.any(Object),
        policiesByType: expect.any(Object),
        expiringIn30Days: expect.any(Number),
        expiringIn90Days: expect.any(Number),
      });
    });
  });

  describe('GET /insurance/:id', () => {
    let insurancePolicy: InsurancePolicy;

    beforeEach(async () => {
      insurancePolicy = await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-008',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 50000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should return a specific insurance policy', async () => {
      const response = await request(app.getHttpServer())
        .get(`/insurance/${insurancePolicy.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: insurancePolicy.id,
        policyNumber: insurancePolicy.policyNumber,
        provider: insurancePolicy.provider,
      });
    });

    it('should return 404 for non-existent insurance policy', async () => {
      await request(app.getHttpServer())
        .get('/insurance/non-existent-id')
        .expect(404);
    });
  });

  describe('PATCH /insurance/:id', () => {
    let insurancePolicy: InsurancePolicy;

    beforeEach(async () => {
      insurancePolicy = await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-009',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 50000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should update an insurance policy', async () => {
      const updateDto = {
        provider: 'Updated Insurance Co.',
        status: InsurancePolicyStatus.SUSPENDED,
        insuredValue: 60000,
      };

      const response = await request(app.getHttpServer())
        .patch(`/insurance/${insurancePolicy.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: insurancePolicy.id,
        provider: updateDto.provider,
        status: updateDto.status,
        insuredValue: updateDto.insuredValue,
      });
    });
  });

  describe('DELETE /insurance/:id', () => {
    let insurancePolicy: InsurancePolicy;

    beforeEach(async () => {
      insurancePolicy = await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-010',
        provider: 'ABC Insurance Co.',
        assetId: 'asset-123',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 50000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should delete an insurance policy', async () => {
      await request(app.getHttpServer())
        .delete(`/insurance/${insurancePolicy.id}`)
        .expect(204);

      const deletedPolicy = await insurancePolicyRepository.findOne({
        where: { id: insurancePolicy.id },
      });
      expect(deletedPolicy).toBeNull();
    });
  });

  describe('GET /insurance/expiring', () => {
    beforeEach(async () => {
      // Create a policy expiring in 15 days
      const expiringDate = new Date();
      expiringDate.setDate(expiringDate.getDate() + 15);

      await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-011',
        provider: 'Expiring Insurance Co.',
        assetId: 'asset-expiring',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: expiringDate,
        insuredValue: 25000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should return expiring insurance policies', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance/expiring')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].provider).toBe('Expiring Insurance Co.');
    });
  });

  describe('GET /insurance/expired', () => {
    beforeEach(async () => {
      // Create an expired policy
      await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-012',
        provider: 'Expired Insurance Co.',
        assetId: 'asset-expired',
        coverageStart: new Date('2023-01-01'),
        coverageEnd: new Date('2023-12-31'),
        insuredValue: 25000,
        status: InsurancePolicyStatus.ACTIVE, // Will be detected as expired
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should return expired insurance policies', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance/expired')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].provider).toBe('Expired Insurance Co.');
    });
  });

  describe('GET /insurance/asset/:assetId', () => {
    beforeEach(async () => {
      await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-013',
        provider: 'Asset Insurance Co.',
        assetId: 'specific-asset-123',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 75000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.PREMIUM,
        renewalReminderDays: 30,
      });
    });

    it('should return insurance policies for a specific asset', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance/asset/specific-asset-123')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        assetId: 'specific-asset-123',
        provider: 'Asset Insurance Co.',
        insuredValue: 75000,
      });
    });
  });

  describe('GET /insurance/category/:category', () => {
    beforeEach(async () => {
      await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-014',
        provider: 'Category Insurance Co.',
        assetCategory: 'hardware',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 100000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.EQUIPMENT,
        coverageLevel: CoverageLevel.COMPREHENSIVE,
        renewalReminderDays: 30,
      });
    });

    it('should return insurance policies for a specific category', async () => {
      const response = await request(app.getHttpServer())
        .get('/insurance/category/hardware')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        assetCategory: 'hardware',
        provider: 'Category Insurance Co.',
        insuranceType: InsuranceType.EQUIPMENT,
      });
    });
  });

  describe('PATCH /insurance/:id/renew', () => {
    let insurancePolicy: InsurancePolicy;

    beforeEach(async () => {
      insurancePolicy = await insurancePolicyRepository.save({
        policyNumber: 'POL-2024-015',
        provider: 'Renewable Insurance Co.',
        assetId: 'renewable-asset',
        coverageStart: new Date('2024-01-01'),
        coverageEnd: new Date('2024-12-31'),
        insuredValue: 40000,
        status: InsurancePolicyStatus.ACTIVE,
        insuranceType: InsuranceType.COMPREHENSIVE,
        coverageLevel: CoverageLevel.STANDARD,
        renewalReminderDays: 30,
      });
    });

    it('should renew an insurance policy', async () => {
      const renewalData = {
        newCoverageEnd: '2025-12-31T23:59:59Z',
        newInsuredValue: 45000,
      };

      const response = await request(app.getHttpServer())
        .patch(`/insurance/${insurancePolicy.id}/renew`)
        .send(renewalData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: insurancePolicy.id,
        insuredValue: renewalData.newInsuredValue,
        status: InsurancePolicyStatus.ACTIVE,
      });
      expect(new Date(response.body.coverageEnd)).toEqual(new Date(renewalData.newCoverageEnd));
      expect(response.body.lastRenewalDate).toBeDefined();
    });

    it('should return 400 when new coverage end date is in the past', async () => {
      const renewalData = {
        newCoverageEnd: '2023-01-01T00:00:00Z',
      };

      await request(app.getHttpServer())
        .patch(`/insurance/${insurancePolicy.id}/renew`)
        .send(renewalData)
        .expect(400);
    });
  });
});
