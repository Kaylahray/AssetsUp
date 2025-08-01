import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKey, ApiKeyScope } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import * as bcrypt from 'bcrypt';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repository: Repository<ApiKey>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    repository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));

    // Reset mocks
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateApiKey', () => {
    it('should generate a new API key successfully', async () => {
      const createDto: CreateApiKeyDto = {
        name: 'Test API Key',
        description: 'Test description',
        scopes: [ApiKeyScope.READ],
        expirationDate: '2024-12-31T23:59:59.999Z',
      };
      const ownerId = 'user-123';

      const mockApiKey = {
        id: 'api-key-123',
        name: createDto.name,
        description: createDto.description,
        ownerId,
        scopes: createDto.scopes,
        expirationDate: new Date(createDto.expirationDate),
        revoked: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockApiKey);
      mockRepository.save.mockResolvedValue(mockApiKey);

      const result = await service.generateApiKey(createDto, ownerId);

      expect(result).toHaveProperty('key');
      expect(result.key).toMatch(/^ak_[a-f0-9]{64}$/);
      expect(result.name).toBe(createDto.name);
      expect(result.ownerId).toBe(ownerId);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for past expiration date', async () => {
      const createDto: CreateApiKeyDto = {
        name: 'Test API Key',
        scopes: [ApiKeyScope.READ],
        expirationDate: '2020-01-01T00:00:00.000Z', // Past date
      };
      const ownerId = 'user-123';

      await expect(service.generateApiKey(createDto, ownerId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllForUser', () => {
    it('should return filtered API keys for user', async () => {
      const ownerId = 'user-123';
      const mockApiKeys = [
        {
          id: 'api-key-1',
          name: 'Key 1',
          ownerId,
          scopes: [ApiKeyScope.READ],
          revoked: false,
          createdAt: new Date(),
        },
        {
          id: 'api-key-2',
          name: 'Key 2',
          ownerId,
          scopes: [ApiKeyScope.WRITE],
          revoked: false,
          createdAt: new Date(),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockApiKeys);

      const result = await service.findAllForUser(ownerId, {});

      expect(result).toHaveLength(2);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('apiKey');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'apiKey.ownerId = :ownerId',
        { ownerId },
      );
    });

    it('should apply name filter', async () => {
      const ownerId = 'user-123';
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAllForUser(ownerId, { name: 'test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'apiKey.name ILIKE :name',
        { name: '%test%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return API key if found', async () => {
      const id = 'api-key-123';
      const ownerId = 'user-123';
      const mockApiKey = {
        id,
        name: 'Test Key',
        ownerId,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.findOne(id, ownerId);

      expect(result.id).toBe(id);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, ownerId },
      });
    });

    it('should throw NotFoundException if API key not found', async () => {
      const id = 'non-existent';
      const ownerId = 'user-123';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, ownerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update API key successfully', async () => {
      const id = 'api-key-123';
      const ownerId = 'user-123';
      const updateDto: UpdateApiKeyDto = {
        name: 'Updated Key',
        description: 'Updated description',
      };

      const mockApiKey = {
        id,
        name: 'Original Key',
        ownerId,
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedApiKey = { ...mockApiKey, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue(updatedApiKey);

      const result = await service.update(id, updateDto, ownerId);

      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
    });

    it('should throw BadRequestException for revoked key', async () => {
      const id = 'api-key-123';
      const ownerId = 'user-123';
      const updateDto: UpdateApiKeyDto = { name: 'Updated Key' };

      const mockApiKey = {
        id,
        ownerId,
        revoked: true, // Key is revoked
      };

      mockRepository.findOne.mockResolvedValue(mockApiKey);

      await expect(service.update(id, updateDto, ownerId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('revoke', () => {
    it('should revoke API key successfully', async () => {
      const id = 'api-key-123';
      const ownerId = 'user-123';
      const revokedBy = 'user-123';
      const revokeDto: RevokeApiKeyDto = {
        reason: 'Security breach',
      };

      const mockApiKey = {
        id,
        ownerId,
        revoked: false,
        save: jest.fn(),
      };

      const revokedApiKey = {
        ...mockApiKey,
        revoked: true,
        revokedAt: expect.any(Date),
        revokedBy,
        revokedReason: revokeDto.reason,
      };

      mockRepository.findOne.mockResolvedValue(mockApiKey);
      mockRepository.save.mockResolvedValue(revokedApiKey);

      const result = await service.revoke(id, revokeDto, ownerId, revokedBy);

      expect(result.revoked).toBe(true);
      expect(result.revokedReason).toBe(revokeDto.reason);
    });

    it('should throw BadRequestException for already revoked key', async () => {
      const id = 'api-key-123';
      const ownerId = 'user-123';
      const revokedBy = 'user-123';
      const revokeDto: RevokeApiKeyDto = {};

      const mockApiKey = {
        id,
        ownerId,
        revoked: true, // Already revoked
      };

      mockRepository.findOne.mockResolvedValue(mockApiKey);

      await expect(
        service.revoke(id, revokeDto, ownerId, revokedBy),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateApiKey', () => {
    it('should validate correct API key', async () => {
      const rawKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      const hashedKey = await bcrypt.hash(rawKey, 12);

      const mockApiKey = {
        id: 'api-key-123',
        keyHash: hashedKey,
        revoked: false,
        expirationDate: null,
        owner: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockRepository.find.mockResolvedValue([mockApiKey]);
      mockRepository.update.mockResolvedValue({});

      const result = await service.validateApiKey(rawKey);

      expect(result.isValid).toBe(true);
      expect(result.apiKey).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should reject invalid API key format', async () => {
      const invalidKey = 'invalid-key';

      const result = await service.validateApiKey(invalidKey);

      expect(result.isValid).toBe(false);
      expect(result.apiKey).toBeUndefined();
      expect(result.user).toBeUndefined();
    });

    it('should reject expired API key', async () => {
      const rawKey = 'ak_1234567890abcdef1234567890abcdef12345678';
      const hashedKey = await bcrypt.hash(rawKey, 12);

      const mockApiKey = {
        id: 'api-key-123',
        keyHash: hashedKey,
        revoked: false,
        expirationDate: new Date('2020-01-01'), // Expired
        owner: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      mockRepository.find.mockResolvedValue([mockApiKey]);

      const result = await service.validateApiKey(rawKey);

      expect(result.isValid).toBe(false);
    });
  });

  describe('hasScope', () => {
    it('should return true for admin scope', () => {
      const apiKey = {
        scopes: [ApiKeyScope.ADMIN],
      } as ApiKey;

      const result = service.hasScope(apiKey, ApiKeyScope.READ);

      expect(result).toBe(true);
    });

    it('should return true for matching scope', () => {
      const apiKey = {
        scopes: [ApiKeyScope.READ, ApiKeyScope.WRITE],
      } as ApiKey;

      const result = service.hasScope(apiKey, ApiKeyScope.READ);

      expect(result).toBe(true);
    });

    it('should return false for missing scope', () => {
      const apiKey = {
        scopes: [ApiKeyScope.READ],
      } as ApiKey;

      const result = service.hasScope(apiKey, ApiKeyScope.WRITE);

      expect(result).toBe(false);
    });
  });
});
