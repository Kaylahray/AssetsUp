import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ApiKeysModule } from './api-keys.module';
import { ApiKey, ApiKeyScope } from './entities/api-key.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

describe('ApiKeysController (e2e)', () => {
  let app: INestApplication;
  let apiKeyRepository: Repository<ApiKey>;
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
          entities: [ApiKey, User],
          synchronize: true,
        }),
        ApiKeysModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    apiKeyRepository = moduleFixture.get<Repository<ApiKey>>(
      getRepositoryToken(ApiKey),
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
    // Clean up API keys before each test
    await apiKeyRepository.clear();
  });

  describe('/api-keys (POST)', () => {
    it('should create a new API key', () => {
      const createDto = {
        name: 'Test API Key',
        description: 'Test description',
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
        expirationDate: '2024-12-31T23:59:59.999Z',
      };

      return request(app.getHttpServer())
        .post('/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('key');
          expect(res.body.key).toMatch(/^ak_[a-f0-9]{64}$/);
          expect(res.body.name).toBe(createDto.name);
          expect(res.body.description).toBe(createDto.description);
          expect(res.body.scopes).toEqual(createDto.scopes);
          expect(res.body.ownerId).toBe(testUser.id);
          expect(res.body.revoked).toBe(false);
        });
    });

    it('should reject invalid scopes', () => {
      const createDto = {
        name: 'Test API Key',
        scopes: ['invalid-scope'],
      };

      return request(app.getHttpServer())
        .post('/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should reject past expiration date', () => {
      const createDto = {
        name: 'Test API Key',
        scopes: [ApiKeyScope.READ],
        expirationDate: '2020-01-01T00:00:00.000Z',
      };

      return request(app.getHttpServer())
        .post('/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(400);
    });

    it('should require authentication', () => {
      const createDto = {
        name: 'Test API Key',
        scopes: [ApiKeyScope.READ],
      };

      return request(app.getHttpServer())
        .post('/api-keys')
        .send(createDto)
        .expect(401);
    });
  });

  describe('/api-keys (GET)', () => {
    beforeEach(async () => {
      // Create test API keys
      const apiKey1 = apiKeyRepository.create({
        name: 'Test Key 1',
        keyHash: 'hash1',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        usageCount: 0,
      });

      const apiKey2 = apiKeyRepository.create({
        name: 'Test Key 2',
        keyHash: 'hash2',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.WRITE],
        revoked: true,
        usageCount: 5,
      });

      await apiKeyRepository.save([apiKey1, apiKey2]);
    });

    it('should return all API keys for user', () => {
      return request(app.getHttpServer())
        .get('/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).not.toHaveProperty('keyHash');
          expect(res.body[0]).not.toHaveProperty('key');
        });
    });

    it('should filter by name', () => {
      return request(app.getHttpServer())
        .get('/api-keys?name=Key 1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].name).toBe('Test Key 1');
        });
    });

    it('should filter by revoked status', () => {
      return request(app.getHttpServer())
        .get('/api-keys?revoked=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].revoked).toBe(true);
        });
    });
  });

  describe('/api-keys/:id (GET)', () => {
    let testApiKey: ApiKey;

    beforeEach(async () => {
      testApiKey = apiKeyRepository.create({
        name: 'Test Key',
        keyHash: 'hash',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        usageCount: 0,
      });
      await apiKeyRepository.save(testApiKey);
    });

    it('should return specific API key', () => {
      return request(app.getHttpServer())
        .get(`/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testApiKey.id);
          expect(res.body.name).toBe(testApiKey.name);
          expect(res.body).not.toHaveProperty('keyHash');
        });
    });

    it('should return 404 for non-existent key', () => {
      return request(app.getHttpServer())
        .get('/api-keys/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api-keys/:id (PATCH)', () => {
    let testApiKey: ApiKey;

    beforeEach(async () => {
      testApiKey = apiKeyRepository.create({
        name: 'Test Key',
        keyHash: 'hash',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        usageCount: 0,
      });
      await apiKeyRepository.save(testApiKey);
    });

    it('should update API key', () => {
      const updateDto = {
        name: 'Updated Key',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateDto.name);
          expect(res.body.description).toBe(updateDto.description);
        });
    });

    it('should reject update of revoked key', async () => {
      // Revoke the key first
      testApiKey.revoked = true;
      await apiKeyRepository.save(testApiKey);

      const updateDto = {
        name: 'Updated Key',
      };

      return request(app.getHttpServer())
        .patch(`/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('/api-keys/:id/revoke (POST)', () => {
    let testApiKey: ApiKey;

    beforeEach(async () => {
      testApiKey = apiKeyRepository.create({
        name: 'Test Key',
        keyHash: 'hash',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        usageCount: 0,
      });
      await apiKeyRepository.save(testApiKey);
    });

    it('should revoke API key', () => {
      const revokeDto = {
        reason: 'Security breach',
      };

      return request(app.getHttpServer())
        .post(`/api-keys/${testApiKey.id}/revoke`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(revokeDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.revoked).toBe(true);
          expect(res.body.revokedReason).toBe(revokeDto.reason);
          expect(res.body.revokedAt).toBeDefined();
        });
    });

    it('should reject revoking already revoked key', async () => {
      // Revoke the key first
      testApiKey.revoked = true;
      await apiKeyRepository.save(testApiKey);

      return request(app.getHttpServer())
        .post(`/api-keys/${testApiKey.id}/revoke`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('/api-keys/:id/reactivate (POST)', () => {
    let testApiKey: ApiKey;

    beforeEach(async () => {
      testApiKey = apiKeyRepository.create({
        name: 'Test Key',
        keyHash: 'hash',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: true,
        revokedAt: new Date(),
        revokedReason: 'Test revocation',
        usageCount: 0,
      });
      await apiKeyRepository.save(testApiKey);
    });

    it('should reactivate revoked API key', () => {
      return request(app.getHttpServer())
        .post(`/api-keys/${testApiKey.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.revoked).toBe(false);
          expect(res.body.revokedAt).toBeNull();
          expect(res.body.revokedReason).toBeNull();
        });
    });

    it('should reject reactivating non-revoked key', async () => {
      // Make the key active first
      testApiKey.revoked = false;
      testApiKey.revokedAt = null;
      await apiKeyRepository.save(testApiKey);

      return request(app.getHttpServer())
        .post(`/api-keys/${testApiKey.id}/reactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/api-keys/:id (DELETE)', () => {
    let testApiKey: ApiKey;

    beforeEach(async () => {
      testApiKey = apiKeyRepository.create({
        name: 'Test Key',
        keyHash: 'hash',
        ownerId: testUser.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        usageCount: 0,
      });
      await apiKeyRepository.save(testApiKey);
    });

    it('should delete API key', () => {
      return request(app.getHttpServer())
        .delete(`/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should return 404 for non-existent key', () => {
      return request(app.getHttpServer())
        .delete('/api-keys/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
