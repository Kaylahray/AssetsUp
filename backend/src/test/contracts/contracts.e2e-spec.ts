import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Contracts E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/contracts (POST) should create a contract', async () => {
    const res = await request(app.getHttpServer())
      .post('/contracts')
      .send({
        vendorId: 'vendor-123',
        title: 'E2E Contract',
        terms: '6 months',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        documentUrl: 'http://example.com/doc.pdf',
        status: 'Active',
      })
      .expect(201);

    expect(res.body.title).toBe('E2E Contract');
  });

  it('/contracts (GET) should return array', async () => {
    const res = await request(app.getHttpServer())
      .get('/contracts')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
