
// Add comments
const c1 = addCommentHandler(r1.id, 'admin', 'Please provide more details.');
const c2 = addCommentHandler(r1.id, 'user1', 'Uploaded a clearer photo.');
console.log('Comments for r1:', listCommentsHandler(r1.id));

// Search by description
console.log('Search "damaged":', listIncidentsHandler({ search: 'damaged' }));
console.log('Search "unauthorized":', listIncidentsHandler({ search: 'unauthorized' }));
console.log('Search "notfound":', listIncidentsHandler({ search: 'notfound' }));

// Reopen a resolved incident
const reopened = reopenIncidentHandler(r2.id);
console.log('Reopened incident:', reopened);
console.log('All incidents after reopen:', listIncidentsHandler());
console.log('Open incidents after reopen:', listIncidentsHandler({ status: 'OPEN' }));
console.log('Resolved incidents after reopen:', listIncidentsHandler({ status: 'RESOLVED' }));
// Test for Incident Reporting Module (no dependencies)

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentReportingModule } from './incident-reporting.module';
import { IncidentReport, IncidentReportType, IncidentStatus } from './incident-report.entity';







describe('IncidentReporting (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [IncidentReport],
          synchronize: true,
        }),
        IncidentReportingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create, list, update, escalate, close', async () => {
    const createDto = {
      title: 'Damaged asset',
      description: 'Screen cracked',
      reportType: IncidentReportType.ASSET_ISSUE,
      referenceId: 'ASSET-001',
      submittedBy: 'user-1',
    };

    const createRes = await request(app.getHttpServer())
      .post('/incident-reports')
      .send(createDto)
      .expect(201);
    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.status).toBe(IncidentStatus.OPEN);

    const id = createRes.body.id;

    await request(app.getHttpServer())
      .get('/incident-reports')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
      });

    const updateDto = { description: 'Screen cracked badly' };
    const updateRes = await request(app.getHttpServer())
      .patch(`/incident-reports/${id}`)
      .send(updateDto)
      .expect(200);
    expect(updateRes.body.description).toBe(updateDto.description);

    const escalateRes = await request(app.getHttpServer())
      .patch(`/incident-reports/${id}/escalate`)
      .expect(200);
    expect(escalateRes.body.status).toBe(IncidentStatus.ESCALATED);

    const closeRes = await request(app.getHttpServer())
      .patch(`/incident-reports/${id}/close`)
      .expect(200);
    expect(closeRes.body.status).toBe(IncidentStatus.CLOSED);
  });
});
