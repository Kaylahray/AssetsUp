import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { describe } from 'node:test';
import { TransferModule } from './transfer.module';
import { TransferRequest } from './transfer-request.entity';
import { TransferStatus } from './enums/transfer-status.enum';

describe('TransferModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [TransferRequest],
          synchronize: true,
        }),
        TransferModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /transfer-requests -> creates', async () => {
    const res = await request(app.getHttpServer())
      .post('/transfer-requests')
      .send({
        assetId: 'ASSET-001',
        requestedBy: 'user-123',
        fromLocation: 'Lagos',
        toLocation: 'Abuja',
        reason: 'Ops move',
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe(TransferStatus.Initiated);
  });

  it('GET /transfer-requests?destination=Abuja -> filters', async () => {
    const res = await request(app.getHttpServer())
      .get('/transfer-requests')
      .query({ destination: 'Abuja' })
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /transfer-requests/:id -> updates status', async () => {
    const list = await request(app.getHttpServer()).get('/transfer-requests').expect(200);
    const id = list.body.data[0].id;

    const res = await request(app.getHttpServer())
      .patch(`/transfer-requests/${id}`)
      .send({ status: TransferStatus.InTransit })
      .expect(200);

    expect(res.body.status).toBe(TransferStatus.InTransit);
  });
});