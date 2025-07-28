import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { WarrantyClaimsModule } from '../warranty-claims.module';
import { WarrantyClaim } from '../entities/warranty-claim.entity';
import { WarrantyClaimStatus } from '../enums/warranty-claim-status.enum';

describe('WarrantyClaimsController (e2e)', () => {
  let app: INestApplication;
  let createdClaimId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [WarrantyClaim],
          synchronize: true,
        }),
        WarrantyClaimsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/warranty-claims (POST)', () => {
    it('should create a warranty claim', () => {
      const createDto = {
        assetId: '123e4567-e89b-12d3-a456-426614174001',
        warrantyId: '123e4567-e89b-12d3-a456-426614174002',
        description: 'Test warranty claim for E2E testing',
        vendorId: '123e4567-e89b-12d3-a456-426614174003',
      };

      return request(app.getHttpServer())
        .post('/warranty-claims')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('claimId');
          expect(res.body.status).toBe(WarrantyClaimStatus.SUBMITTED);
          expect(res.body.assetId).toBe(createDto.assetId);
          expect(res.body.description).toBe(createDto.description);
          createdClaimId = res.body.claimId;
        });
    });

    it('should validate required fields', () => {
      const invalidDto = {
        assetId: '123e4567-e89b-12d3-a456-426614174001',
        // missing warrantyId and description
      };

      return request(app.getHttpServer())
        .post('/warranty-claims')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/warranty-claims (GET)', () => {
    it('should return paginated warranty claims', () => {
      return request(app.getHttpServer())
        .get('/warranty-claims')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter by status', () => {
      return request(app.getHttpServer())
        .get('/warranty-claims')
        .query({ status: WarrantyClaimStatus.SUBMITTED })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every(
            (claim: WarrantyClaim) => claim.status === WarrantyClaimStatus.SUBMITTED
          )).toBe(true);
        });
    });
  });

  describe('/warranty-claims/:id (GET)', () => {
    it('should return a warranty claim by ID', () => {
      return request(app.getHttpServer())
        .get(`/warranty-claims/${createdClaimId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.claimId).toBe(createdClaimId);
        });
    });

    it('should return 404 for non-existent claim', () => {
      return request(app.getHttpServer())
        .get('/warranty-claims/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);
    });
  });

  describe('/warranty-claims/:id (PATCH)', () => {
    it('should update a warranty claim', () => {
      const updateDto = {
        description: 'Updated warranty claim description',
      };

      return request(app.getHttpServer())
        .patch(`/warranty-claims/${createdClaimId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.description).toBe(updateDto.description);
        });
    });
  });

  describe('Status transition lifecycle', () => {
    it('should follow valid status transitions', async () => {
      // Submitted -> In Review
      await request(app.getHttpServer())
        .patch(`/warranty-claims/${createdClaimId}/status`)
        .send({
          status: WarrantyClaimStatus.IN_REVIEW,
          resolutionNotes: 'Claim is under review',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(WarrantyClaimStatus.IN_REVIEW);
        });

      // In Review -> Approved
      await request(app.getHttpServer())
        .patch(`/warranty-claims/${createdClaimId}/status`)
        .send({
          status: WarrantyClaimStatus.APPROVED,
          resolutionNotes: 'Claim approved for resolution',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(WarrantyClaimStatus.APPROVED);
        });

      // Approved -> Resolved
      await request(app.getHttpServer())
        .patch(`/warranty-claims/${createdClaimId}/status`)
        .send({
          status: WarrantyClaimStatus.RESOLVED,
          resolutionNotes: 'Claim resolved successfully',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(WarrantyClaimStatus.RESOLVED);
        });
    });

    it('should reject invalid status transitions', async () => {
      // Create a new claim for testing invalid transitions
      const createResponse = await request(app.getHttpServer())
        .post('/warranty-claims')
        .send({
          assetId: '123e4567-e89b-12d3-a456-426614174004',
          warrantyId: '123e4567-e89b-12d3-a456-426614174005',
          description: 'Test claim for invalid transitions',
        })
        .expect(201);

      const newClaimId = createResponse.body.claimId;

      // Try to go directly from Submitted to Resolved (invalid)
      await request(app.getHttpServer())
        .patch(`/warranty-claims/${newClaimId}/status`)
        .send({
          status: WarrantyClaimStatus.RESOLVED,
        })
        .expect(400);
    });
  });

  describe('/warranty-claims/statistics (GET)', () => {
    it('should return claim statistics', () => {
      return request(app.getHttpServer())
        .get('/warranty-claims/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty(WarrantyClaimStatus.SUBMITTED);
          expect(res.body).toHaveProperty(WarrantyClaimStatus.IN_REVIEW);
          expect(res.body).toHaveProperty(WarrantyClaimStatus.APPROVED);
          expect(res.body).toHaveProperty(WarrantyClaimStatus.REJECTED);
          expect(res.body).toHaveProperty(WarrantyClaimStatus.RESOLVED);
        });
    });
  });

  describe('/warranty-claims/status/:status (GET)', () => {
    it('should return claims by status', () => {
      return request(app.getHttpServer())
        .get(`/warranty-claims/status/${WarrantyClaimStatus.RESOLVED}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body.every(
              (claim: WarrantyClaim) => claim.status === WarrantyClaimStatus.RESOLVED
            )).toBe(true);
          }
        });
    });
  });

  describe('/warranty-claims/:id (DELETE)', () => {
    it('should delete a warranty claim', async () => {
      // Create a claim to delete
      const createResponse = await request(app.getHttpServer())
        .post('/warranty-claims')
        .send({
          assetId: '123e4567-e89b-12d3-a456-426614174006',
          warrantyId: '123e4567-e89b-12d3-a456-426614174007',
          description: 'Test claim for deletion',
        })
        .expect(201);

      const claimToDelete = createResponse.body.claimId;

      // Delete the claim
      await request(app.getHttpServer())
        .delete(`/warranty-claims/${claimToDelete}`)
        .expect(204);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/warranty-claims/${claimToDelete}`)
        .expect(404);
    });
  });
});