import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaggingModule } from '../src/tagging/tagging.module';
import { Tag } from '../src/tagging/entities/tag.entity';
import { TaggedResource } from '../src/tagging/entities/tagged-resource.entity';

describe('TaggingController (e2e)', () => {
  let app: INestApplication;
  let tagId: string;
  const userId = 'test-user-1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Tag, TaggedResource],
          synchronize: true,
        }),
        TaggingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { id: userId };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tags (POST)', () => {
    it('should create a new tag', () => {
      return request(app.getHttpServer())
        .post('/tags')
        .send({
          name: 'Important',
          description: 'High priority items',
          colorHex: '#FF0000',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.name).toBe('Important');
          expect(response.body.colorHex).toBe('#FF0000');
          tagId = response.body.id;
        });
    });

    it('should return 409 for duplicate tag name', () => {
      return request(app.getHttpServer())
        .post('/tags')
        .send({
          name: 'Important',
          description: 'Another important tag',
        })
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/tags')
        .send({
          name: '', // Empty name should fail validation
        })
        .expect(400);
    });
  });

  describe('/tags (GET)', () => {
    it('should return all tags for user', () => {
      return request(app.getHttpServer())
        .get('/tags')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('name', 'Important');
        });
    });

    it('should filter tags by search query', () => {
      return request(app.getHttpServer())
        .get('/tags?search=Important')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.every(tag => tag.name.includes('Important'))).toBe(true);
        });
    });
  });

  describe('/tags/:id (GET)', () => {
    it('should return a specific tag', () => {
      return request(app.getHttpServer())
        .get(`/tags/${tagId}`)
        .expect(200)
        .then((response) => {
          expect(response.body.id).toBe(tagId);
          expect(response.body.name).toBe('Important');
        });
    });

    it('should return 404 for non-existent tag', () => {
      return request(app.getHttpServer())
        .get('/tags/non-existent-id')
        .expect(404);
    });
  });

  describe('/tags/:id (PATCH)', () => {
    it('should update a tag', () => {
      return request(app.getHttpServer())
        .patch(`/tags/${tagId}`)
        .send({
          name: 'Updated Important',
          colorHex: '#00FF00',
        })
        .expect(200)
        .then((response) => {
          expect(response.body.name).toBe('Updated Important');
          expect(response.body.colorHex).toBe('#00FF00');
        });
    });
  });

  describe('/tags/:tagId/assign (POST)', () => {
    it('should assign a tag to a resource', () => {
      return request(app.getHttpServer())
        .post(`/tags/${tagId}/assign`)
        .send({
          resourceId: 'resource-1',
          resourceType: 'document',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('tagId', tagId);
          expect(response.body).toHaveProperty('resourceId', 'resource-1');
          expect(response.body).toHaveProperty('resourceType', 'document');
        });
    });

    it('should return 409 for duplicate assignment', () => {
      return request(app.getHttpServer())
        .post(`/tags/${tagId}/assign`)
        .send({
          resourceId: 'resource-1',
          resourceType: 'document',
        })
        .expect(409);
    });
  });

  describe('/tags/by-resource/:resourceId/:resourceType (GET)', () => {
    it('should return tags for a resource', () => {
      return request(app.getHttpServer())
        .get('/tags/by-resource/resource-1/document')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body[0]).toHaveProperty('name', 'Updated Important');
        });
    });
  });

  describe('/tags/bulk-assign (POST)', () => {
    let secondTagId: string;

    beforeAll(async () => {
      // Create a second tag for bulk operations
      const response = await request(app.getHttpServer())
        .post('/tags')
        .send({
          name: 'Urgent',
          colorHex: '#FFA500',
        });
      secondTagId = response.body.id;
    });

    it('should bulk assign tags to resources', () => {
      return request(app.getHttpServer())
        .post('/tags/bulk-assign')
        .send({
          resourceIds: ['resource-2', 'resource-3'],
          resourceType: 'document',
          tagIds: [tagId, secondTagId],
        })
        .expect(201)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(4); // 2 resources × 2 tags
        });
    });
  });

  describe('/tags/:tagId/resources (GET)', () => {
    it('should return resources tagged with a specific tag', () => {
      return request(app.getHttpServer())
        .get(`/tags/${tagId}/resources`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
          expect(response.body.every(tr => tr.tagId === tagId)).toBe(true);
        });
    });
  });

  describe('/tags/:tagId/unassign/:resourceId/:resourceType (DELETE)', () => {
    it('should unassign a tag from a resource', () => {
      return request(app.getHttpServer())
        .delete(`/tags/${tagId}/unassign/resource-1/document`)
        .expect(204);
    });

    it('should return 404 for non-existent assignment', () => {
      return request(app.getHttpServer())
        .delete(`/tags/${tagId}/unassign/non-existent/document`)
        .expect(404);
    });
  });

  describe('/tags/:id (DELETE)', () => {
    it('should delete a tag', () => {
      return request(app.getHttpServer())
        .delete(`/tags/${tagId}`)
        .expect(204);
    });

    it('should return 404 for non-existent tag', () => {
      return request(app.getHttpServer())
        .delete('/tags/non-existent-id')
        .expect(404);
    });
  });
});
