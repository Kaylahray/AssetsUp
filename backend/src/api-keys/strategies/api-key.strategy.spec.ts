import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeysService } from '../api-keys.service';
import { ApiKeyScope } from '../entities/api-key.entity';

describe('ApiKeyStrategy', () => {
  let strategy: ApiKeyStrategy;
  let apiKeysService: ApiKeysService;

  const mockApiKeysService = {
    validateApiKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyStrategy,
        {
          provide: ApiKeysService,
          useValue: mockApiKeysService,
        },
      ],
    }).compile();

    strategy = module.get<ApiKeyStrategy>(ApiKeyStrategy);
    apiKeysService = module.get<ApiKeysService>(ApiKeysService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockRequest = {
      headers: {},
      query: {},
    };

    const mockValidation = {
      isValid: true,
      apiKey: {
        id: 'api-key-123',
        scopes: [ApiKeyScope.READ],
        ownerId: 'user-123',
      },
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
    };

    it('should validate API key from Authorization header', async () => {
      const apiKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      mockRequest.headers.authorization = `Bearer ${apiKey}`;

      mockApiKeysService.validateApiKey.mockResolvedValue(mockValidation);

      const result = await strategy.validate(mockRequest);

      expect(result).toEqual({
        id: mockValidation.user.id,
        email: mockValidation.user.email,
        name: mockValidation.user.name,
        role: mockValidation.user.role,
        apiKey: mockValidation.apiKey,
        authType: 'api-key',
      });
      expect(mockApiKeysService.validateApiKey).toHaveBeenCalledWith(apiKey);
    });

    it('should validate API key from X-API-Key header', async () => {
      const apiKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      mockRequest.headers['x-api-key'] = apiKey;
      delete mockRequest.headers.authorization;

      mockApiKeysService.validateApiKey.mockResolvedValue(mockValidation);

      const result = await strategy.validate(mockRequest);

      expect(result.authType).toBe('api-key');
      expect(mockApiKeysService.validateApiKey).toHaveBeenCalledWith(apiKey);
    });

    it('should validate API key from query parameter', async () => {
      const apiKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      mockRequest.query.api_key = apiKey;
      delete mockRequest.headers.authorization;
      delete mockRequest.headers['x-api-key'];

      mockApiKeysService.validateApiKey.mockResolvedValue(mockValidation);

      const result = await strategy.validate(mockRequest);

      expect(result.authType).toBe('api-key');
      expect(mockApiKeysService.validateApiKey).toHaveBeenCalledWith(apiKey);
    });

    it('should ignore JWT tokens in Authorization header', async () => {
      mockRequest.headers.authorization = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      delete mockRequest.headers['x-api-key'];
      delete mockRequest.query.api_key;

      await expect(strategy.validate(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockApiKeysService.validateApiKey).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when no API key provided', async () => {
      delete mockRequest.headers.authorization;
      delete mockRequest.headers['x-api-key'];
      delete mockRequest.query.api_key;

      await expect(strategy.validate(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockApiKeysService.validateApiKey).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid API key', async () => {
      const apiKey = 'ak_invalid';
      mockRequest.headers.authorization = `Bearer ${apiKey}`;

      mockApiKeysService.validateApiKey.mockResolvedValue({
        isValid: false,
      });

      await expect(strategy.validate(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when validation returns no user', async () => {
      const apiKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      mockRequest.headers.authorization = `Bearer ${apiKey}`;

      mockApiKeysService.validateApiKey.mockResolvedValue({
        isValid: true,
        apiKey: mockValidation.apiKey,
        user: null,
      });

      await expect(strategy.validate(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
