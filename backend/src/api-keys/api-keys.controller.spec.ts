import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { ApiKeyScope } from './entities/api-key.entity';

describe('ApiKeysController', () => {
  let controller: ApiKeysController;
  let service: ApiKeysService;

  const mockApiKeysService = {
    generateApiKey: jest.fn(),
    findAllForUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    revoke: jest.fn(),
    reactivate: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeysController],
      providers: [
        {
          provide: ApiKeysService,
          useValue: mockApiKeysService,
        },
      ],
    }).compile();

    controller = module.get<ApiKeysController>(ApiKeysController);
    service = module.get<ApiKeysService>(ApiKeysService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new API key', async () => {
      const createDto: CreateApiKeyDto = {
        name: 'Test API Key',
        description: 'Test description',
        scopes: [ApiKeyScope.READ],
        expirationDate: '2024-12-31T23:59:59.999Z',
      };

      const expectedResult = {
        id: 'api-key-123',
        key: 'ak_1234567890abcdef1234567890abcdef12345678',
        name: createDto.name,
        description: createDto.description,
        ownerId: mockRequest.user.id,
        scopes: createDto.scopes,
        expirationDate: new Date(createDto.expirationDate),
        revoked: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiKeysService.generateApiKey.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.generateApiKey).toHaveBeenCalledWith(
        createDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return all API keys for user', async () => {
      const queryDto = { name: 'test' };
      const expectedResult = [
        {
          id: 'api-key-1',
          name: 'Test Key 1',
          ownerId: mockRequest.user.id,
          scopes: [ApiKeyScope.READ],
          revoked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockApiKeysService.findAllForUser.mockResolvedValue(expectedResult);

      const result = await controller.findAll(queryDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.findAllForUser).toHaveBeenCalledWith(
        mockRequest.user.id,
        queryDto,
      );
    });
  });

  describe('findOne', () => {
    it('should return a specific API key', async () => {
      const id = 'api-key-123';
      const expectedResult = {
        id,
        name: 'Test Key',
        ownerId: mockRequest.user.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiKeysService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.findOne).toHaveBeenCalledWith(
        id,
        mockRequest.user.id,
      );
    });
  });

  describe('update', () => {
    it('should update an API key', async () => {
      const id = 'api-key-123';
      const updateDto: UpdateApiKeyDto = {
        name: 'Updated Key',
        description: 'Updated description',
      };

      const expectedResult = {
        id,
        name: updateDto.name,
        description: updateDto.description,
        ownerId: mockRequest.user.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiKeysService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.update).toHaveBeenCalledWith(
        id,
        updateDto,
        mockRequest.user.id,
      );
    });
  });

  describe('revoke', () => {
    it('should revoke an API key', async () => {
      const id = 'api-key-123';
      const revokeDto: RevokeApiKeyDto = {
        reason: 'Security breach',
      };

      const expectedResult = {
        id,
        name: 'Test Key',
        ownerId: mockRequest.user.id,
        scopes: [ApiKeyScope.READ],
        revoked: true,
        revokedAt: new Date(),
        revokedBy: mockRequest.user.id,
        revokedReason: revokeDto.reason,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiKeysService.revoke.mockResolvedValue(expectedResult);

      const result = await controller.revoke(id, revokeDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.revoke).toHaveBeenCalledWith(
        id,
        revokeDto,
        mockRequest.user.id,
        mockRequest.user.id,
      );
    });
  });

  describe('reactivate', () => {
    it('should reactivate an API key', async () => {
      const id = 'api-key-123';

      const expectedResult = {
        id,
        name: 'Test Key',
        ownerId: mockRequest.user.id,
        scopes: [ApiKeyScope.READ],
        revoked: false,
        revokedAt: null,
        revokedBy: null,
        revokedReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiKeysService.reactivate.mockResolvedValue(expectedResult);

      const result = await controller.reactivate(id, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(mockApiKeysService.reactivate).toHaveBeenCalledWith(
        id,
        mockRequest.user.id,
      );
    });
  });

  describe('remove', () => {
    it('should delete an API key', async () => {
      const id = 'api-key-123';

      mockApiKeysService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id, mockRequest);

      expect(result).toBeUndefined();
      expect(mockApiKeysService.remove).toHaveBeenCalledWith(
        id,
        mockRequest.user.id,
      );
    });
  });
});
