import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { BarcodeModule } from 'src/barcode/barcode.module';

describe('BarcodeController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [BarcodeModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/barcodes (POST)', () => {
    return request(app.getHttpServer())
      .post('/barcodes')
      .send({ referenceId: 'asset123', type: 'CODE128' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});