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
});
