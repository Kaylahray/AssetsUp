
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: JwtService;
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    passwordHash: '$2a$10$testhash',
    fullName: 'Test User',
    role: 'user',
    phoneNumber: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      userRepository: {
        findOneBy: jest.fn().mockResolvedValue(mockUser),
      },
      findOne: jest.fn().mockResolvedValue(mockUser),
    } as any;
    jwtService = new JwtService({
      secret: 'test',
      signOptions: { expiresIn: '15m' },
    });
    service = new AuthService(usersService as UsersService, jwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct password', async () => {
    jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
    const user = await service.validateUser('test@example.com', 'password');
    expect(user).toBeDefined();
    expect(user?.email).toBe('test@example.com');
  });

  it('should not validate user with wrong password', async () => {
    jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);
    const user = await service.validateUser('test@example.com', 'wrong');
    expect(user).toBeNull();
  });

  it('should login and return tokens', async () => {
    const tokens = await service.login(mockUser);
    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
  });

  it('should refresh token if valid', async () => {
    const tokens = await service.login(mockUser);
    const refreshed = await service.refresh(mockUser.id, tokens.refreshToken);
    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.refreshToken).toBeDefined();
  });

  it('should throw on invalid refresh token', async () => {
    await service.login(mockUser);
    await expect(service.refresh(mockUser.id, 'invalid')).rejects.toThrow();
  });
});
