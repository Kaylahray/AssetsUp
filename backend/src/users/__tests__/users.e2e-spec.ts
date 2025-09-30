import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users.module';
import { User } from '../entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@example.com');
  });

  it('should get all users', async () => {
    const res = await request(app.getHttpServer()).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a user by id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Another User',
        email: 'another@example.com',
        password: 'password123',
        role: 'user',
      });
    const userId = createRes.body.id;
    const res = await request(app.getHttpServer()).get(`/users/${userId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
  });

  it('should update a user', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Update User',
        email: 'update@example.com',
        password: 'password123',
        role: 'user',
      });
    const userId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({ fullName: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Updated Name');
  });

  it('should delete a user', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Delete User',
        email: 'delete@example.com',
        password: 'password123',
        role: 'user',
      });
    const userId = createRes.body.id;
    const res = await request(app.getHttpServer()).delete(`/users/${userId}`);
    expect(res.status).toBe(200);
  });

  it('should not create user with duplicate email', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Dup User',
        email: 'dup@example.com',
        password: 'password123',
        role: 'user',
      });
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Dup User2',
        email: 'dup@example.com',
        password: 'password123',
        role: 'user',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('should filter users by role', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
    const res = await request(app.getHttpServer())
      .get('/users?role=admin');
    expect(res.status).toBe(200);
    expect(res.body.some((u: any) => u.role === 'admin')).toBe(true);
  });

  it('should paginate users', async () => {
    for (let i = 0; i < 15; i++) {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          fullName: `User${i}`,
          email: `user${i}@example.com`,
          password: 'password123',
          role: 'user',
        });
    }
    const res = await request(app.getHttpServer())
      .get('/users?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(10);
  });

  it('should not expose passwordHash in user response', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        fullName: 'Hidden Password',
        email: 'hidden@example.com',
        password: 'password123',
        role: 'user',
      });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app.getHttpServer()).get('/users/non-existent-id');
    expect(res.status).toBe(404);
  });

  it('should validate required fields on create', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'invalid@example.com' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
