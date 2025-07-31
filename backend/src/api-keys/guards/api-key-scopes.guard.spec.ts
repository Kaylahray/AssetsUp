import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ApiKeyScopesGuard } from './api-key-scopes.guard';
import { ApiKeyScope } from '../entities/api-key.entity';

describe('ApiKeyScopesGuard', () => {
  let guard: ApiKeyScopesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyScopesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<ApiKeyScopesGuard>(ApiKeyScopesGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user-123',
          authType: 'api-key',
          apiKey: {
            scopes: [ApiKeyScope.READ],
          },
        },
      };
    });

    it('should allow access when no scopes are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when empty scopes are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access for non-API key authentication', () => {
      mockRequest.user.authType = 'jwt';
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.WRITE]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has admin scope', () => {
      mockRequest.user.apiKey.scopes = [ApiKeyScope.ADMIN];
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.WRITE]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has required scope', () => {
      mockRequest.user.apiKey.scopes = [ApiKeyScope.READ, ApiKeyScope.WRITE];
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.READ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has any of the required scopes', () => {
      mockRequest.user.apiKey.scopes = [ApiKeyScope.READ];
      mockReflector.getAllAndOverride.mockReturnValue([
        ApiKeyScope.READ,
        ApiKeyScope.WRITE,
      ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should deny access when user lacks required scope', () => {
      mockRequest.user.apiKey.scopes = [ApiKeyScope.READ];
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.WRITE]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should deny access when user has no scopes', () => {
      mockRequest.user.apiKey.scopes = [];
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.READ]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should handle missing user', () => {
      mockRequest.user = null;
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.READ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle missing API key in user', () => {
      mockRequest.user.apiKey = null;
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.READ]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should handle undefined scopes in API key', () => {
      mockRequest.user.apiKey.scopes = undefined;
      mockReflector.getAllAndOverride.mockReturnValue([ApiKeyScope.READ]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should provide helpful error message', () => {
      mockRequest.user.apiKey.scopes = [ApiKeyScope.READ];
      mockReflector.getAllAndOverride.mockReturnValue([
        ApiKeyScope.WRITE,
        ApiKeyScope.ADMIN,
      ]);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        new ForbiddenException(
          'Insufficient API key permissions. Required scopes: write, admin',
        ),
      );
    });
  });
});
