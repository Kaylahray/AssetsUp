
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh' }),
      validateUser: jest.fn().mockResolvedValue({ id: '1', email: 'test@example.com', role: 'user' }),
      refresh: jest.fn().mockResolvedValue({ accessToken: 'token2', refreshToken: 'refresh2' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login and return tokens', async () => {
    const result = await controller.login({ email: 'test@example.com', password: 'password' });
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('refresh');
  });

  it('should refresh and return new tokens', async () => {
    const result = await controller.refresh({ userId: '1', refreshToken: 'refresh' });
    expect(result.accessToken).toBe('token2');
    expect(result.refreshToken).toBe('refresh2');
  });
});
