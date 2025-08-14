import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { StatusHistoryModule } from './status-history.module';
import { StatusHistory } from './entities/status-history.entity';

describe('StatusHistoryController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [StatusHistory],
          synchronize: true,
        }),
        StatusHistoryModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /status-history should create a status history record', async () => {
    const dto = {
      assetId: 'asset-123',
      previousStatus: 'active',
      newStatus: 'under_maintenance',
      changedBy: 'tester',
    };

    const res = await request(app.getHttpServer())
      .post('/status-history')
      .send(dto)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.assetId).toBe(dto.assetId);
    expect(res.body.previousStatus).toBe(dto.previousStatus);
    expect(res.body.newStatus).toBe(dto.newStatus);
    expect(res.body.changedBy).toBe(dto.changedBy);
    expect(res.body).toHaveProperty('changeDate');
  });

  it('GET /status-history/:assetId should return records for asset', async () => {
    const res = await request(app.getHttpServer())
      .get('/status-history/asset-123')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('assetId', 'asset-123');
  });
});
