import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainEventsController } from '../blockchain-events.controller';
import { BlockchainEventsService } from '../blockchain-events.service';
import { CreateBlockchainEventDto } from '../dto/create-blockchain-event.dto';
import { UpdateBlockchainEventDto } from '../dto/update-blockchain-event.dto';
import { BlockchainEventsQueryDto } from '../dto/blockchain-events-query.dto';
import { StarkNetMockPayloadDto } from '../dto/starknet-mock-payload.dto';
import { BlockchainEvent } from '../entities/blockchain-event.entity';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BlockchainEventsController', () => {
  let controller: BlockchainEventsController;
  let service: jest.Mocked<BlockchainEventsService>;

  const mockBlockchainEvent: BlockchainEvent = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    assetId: 'asset-123',
    eventType: BlockchainEventType.ASSET_TRANSFER,
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    blockNumber: '123456',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    eventDetails: { amount: '1000000000000000000' },
    network: BlockchainNetwork.STARKNET_MAINNET,
    status: EventStatus.CONFIRMED,
    priority: EventPriority.MEDIUM,
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    fromAddress: '0x1111111111111111111111111111111111111111',
    toAddress: '0x2222222222222222222222222222222222222222',
    gasUsed: '21000',
    gasPrice: '20000000000',
    eventSignature: 'Transfer(address,address,uint256)',
    rawEventData: { topics: [], data: '0x' },
    errorMessage: null,
    confirmations: 12,
    metadata: { source: 'test' },
    createdAt: new Date(),
    updatedAt: new Date(),
    isConfirmed: true,
    isFailed: false,
    isPending: false,
    isHighPriority: false,
    eventAge: 0,
    eventAgeInHours: 0,
    eventAgeInDays: 0,
    hasError: false,
    totalGasCost: '420000000000000',
  };

  const mockStarkNetPayload: StarkNetMockPayloadDto = {
    assetId: 'asset-123',
    eventType: 'asset_transfer',
    receipt: {
      transaction_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      block_number: '123456',
      block_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      transaction_index: '5',
      status: 'ACCEPTED_ON_L2',
      actual_fee: '1234567890123456',
      events: [
        {
          topics: ['0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9'],
          data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
          address: '0x1234567890abcdef1234567890abcdef12345678',
        },
      ],
      execution_resources: {
        n_steps: 1234,
        n_memory_holes: 56,
      },
      messages_sent: [],
    },
    metadata: {
      asset_name: 'Test Asset',
      transfer_reason: 'Test transfer',
    },
    network: 'starknet_mainnet',
    priority: 'medium',
  };

  const mockAnalytics = {
    totalEvents: 100,
    eventsByStatus: { confirmed: 80, pending: 15, failed: 5 },
    eventsByType: { asset_transfer: 50, asset_purchase: 30, asset_disposal: 20 },
    eventsByNetwork: { starknet_mainnet: 100 },
    eventsByPriority: { medium: 60, high: 25, low: 15 },
    recentEvents: [mockBlockchainEvent],
    failedEvents: 5,
    successRate: '95.00',
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      createFromStarkNetPayload: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByTransactionHash: jest.fn(),
      findByAssetId: jest.fn(),
      findByEventType: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getAnalytics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainEventsController],
      providers: [
        {
          provide: BlockchainEventsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<BlockchainEventsController>(BlockchainEventsController);
    service = module.get(BlockchainEventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateBlockchainEventDto = {
      assetId: 'asset-123',
      eventType: BlockchainEventType.ASSET_TRANSFER,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      blockNumber: '123456',
      timestamp: '2024-01-15T10:30:00Z',
      eventDetails: { amount: '1000000000000000000' },
    };

    it('should create a blockchain event', async () => {
      service.create.mockResolvedValue(mockBlockchainEvent);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should handle ConflictException', async () => {
      service.create.mockRejectedValue(new ConflictException('Transaction hash already exists'));

      await expect(controller.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('createFromStarkNetPayload', () => {
    it('should create blockchain event from StarkNet payload', async () => {
      service.createFromStarkNetPayload.mockResolvedValue(mockBlockchainEvent);

      const result = await controller.createFromStarkNetPayload(mockStarkNetPayload);

      expect(service.createFromStarkNetPayload).toHaveBeenCalledWith(mockStarkNetPayload);
      expect(result).toEqual(mockBlockchainEvent);
    });
  });

  describe('findAll', () => {
    const query: BlockchainEventsQueryDto = {
      page: 1,
      limit: 20,
      sortBy: 'timestamp',
      sortOrder: 'DESC',
    };

    const mockResponse = {
      events: [mockBlockchainEvent],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      analytics: mockAnalytics,
    };

    it('should return paginated blockchain events with analytics', async () => {
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty query parameters', async () => {
      service.findAll.mockResolvedValue(mockResponse);

      await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics', async () => {
      service.getAnalytics.mockResolvedValue(mockAnalytics);

      const result = await controller.getAnalytics({});

      expect(service.getAnalytics).toHaveBeenCalledWith({});
      expect(result).toEqual(mockAnalytics);
    });

    it('should pass filters to analytics', async () => {
      const filters = { assetId: 'asset-123', eventType: BlockchainEventType.ASSET_TRANSFER };
      service.getAnalytics.mockResolvedValue(mockAnalytics);

      await controller.getAnalytics(filters);

      expect(service.getAnalytics).toHaveBeenCalledWith(filters);
    });
  });

  describe('findByAssetId', () => {
    it('should return blockchain events for an asset', async () => {
      const mockEvents = [mockBlockchainEvent];
      service.findByAssetId.mockResolvedValue(mockEvents);

      const result = await controller.findByAssetId('asset-123', {});

      expect(service.findByAssetId).toHaveBeenCalledWith('asset-123', {});
      expect(result).toEqual(mockEvents);
    });

    it('should pass query parameters', async () => {
      const query = { eventType: BlockchainEventType.ASSET_TRANSFER, limit: 10 };
      service.findByAssetId.mockResolvedValue([mockBlockchainEvent]);

      await controller.findByAssetId('asset-123', query);

      expect(service.findByAssetId).toHaveBeenCalledWith('asset-123', query);
    });
  });

  describe('findByEventType', () => {
    it('should return blockchain events by event type', async () => {
      const mockEvents = [mockBlockchainEvent];
      service.findByEventType.mockResolvedValue(mockEvents);

      const result = await controller.findByEventType(BlockchainEventType.ASSET_TRANSFER, {});

      expect(service.findByEventType).toHaveBeenCalledWith(BlockchainEventType.ASSET_TRANSFER, {});
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findByTransactionHash', () => {
    it('should return blockchain event by transaction hash', async () => {
      service.findByTransactionHash.mockResolvedValue(mockBlockchainEvent);

      const result = await controller.findByTransactionHash(mockBlockchainEvent.transactionHash);

      expect(service.findByTransactionHash).toHaveBeenCalledWith(mockBlockchainEvent.transactionHash);
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should handle NotFoundException', async () => {
      service.findByTransactionHash.mockRejectedValue(new NotFoundException('Event not found'));

      await expect(controller.findByTransactionHash('invalid-hash')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRecent', () => {
    it('should return recent blockchain events', async () => {
      const mockResponse = {
        events: [mockBlockchainEvent],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        analytics: mockAnalytics,
      };
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findRecent(10);

      expect(service.findAll).toHaveBeenCalledWith({
        limit: 10,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      });
      expect(result).toEqual([mockBlockchainEvent]);
    });

    it('should use default limit', async () => {
      const mockResponse = {
        events: [mockBlockchainEvent],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        analytics: mockAnalytics,
      };
      service.findAll.mockResolvedValue(mockResponse);

      await controller.findRecent();

      expect(service.findAll).toHaveBeenCalledWith({
        limit: 10,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      });
    });
  });

  describe('findFailed', () => {
    it('should return failed blockchain events', async () => {
      const failedEvent = { ...mockBlockchainEvent, status: EventStatus.FAILED, errorMessage: 'Transaction failed' };
      const mockResponse = {
        events: [failedEvent],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        analytics: mockAnalytics,
      };
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findFailed(20);

      expect(service.findAll).toHaveBeenCalledWith({
        hasError: true,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      });
      expect(result).toEqual([failedEvent]);
    });
  });

  describe('findPending', () => {
    it('should return pending blockchain events', async () => {
      const pendingEvent = { ...mockBlockchainEvent, status: EventStatus.PENDING };
      const mockResponse = {
        events: [pendingEvent],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        analytics: mockAnalytics,
      };
      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findPending(20);

      expect(service.findAll).toHaveBeenCalledWith({
        status: 'pending' as any,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      });
      expect(result).toEqual([pendingEvent]);
    });
  });

  describe('findOne', () => {
    it('should return a blockchain event by ID', async () => {
      service.findOne.mockResolvedValue(mockBlockchainEvent);

      const result = await controller.findOne(mockBlockchainEvent.id);

      expect(service.findOne).toHaveBeenCalledWith(mockBlockchainEvent.id);
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should handle NotFoundException', async () => {
      service.findOne.mockRejectedValue(new NotFoundException('Event not found'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateBlockchainEventDto = {
      status: EventStatus.CONFIRMED,
      confirmations: 15,
    };

    it('should update a blockchain event', async () => {
      const updatedEvent = { ...mockBlockchainEvent, ...updateDto };
      service.update.mockResolvedValue(updatedEvent);

      const result = await controller.update(mockBlockchainEvent.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockBlockchainEvent.id, updateDto);
      expect(result).toEqual(updatedEvent);
    });

    it('should handle NotFoundException', async () => {
      service.update.mockRejectedValue(new NotFoundException('Event not found'));

      await expect(controller.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('should confirm a blockchain event', async () => {
      const confirmedEvent = { ...mockBlockchainEvent, status: EventStatus.CONFIRMED, confirmations: 12 };
      service.update.mockResolvedValue(confirmedEvent);

      const result = await controller.confirm(mockBlockchainEvent.id);

      expect(service.update).toHaveBeenCalledWith(mockBlockchainEvent.id, {
        status: 'confirmed' as any,
        confirmations: 12,
        metadata: {
          confirmed_at: expect.any(String),
          confirmed_by: 'system',
        },
      });
      expect(result).toEqual(confirmedEvent);
    });
  });

  describe('markAsFailed', () => {
    it('should mark a blockchain event as failed', async () => {
      const failedEvent = { ...mockBlockchainEvent, status: EventStatus.FAILED, errorMessage: 'Custom error' };
      service.update.mockResolvedValue(failedEvent);

      const result = await controller.markAsFailed(mockBlockchainEvent.id, { errorMessage: 'Custom error' });

      expect(service.update).toHaveBeenCalledWith(mockBlockchainEvent.id, {
        status: 'failed' as any,
        errorMessage: 'Custom error',
        metadata: {
          failed_at: expect.any(String),
          failed_by: 'system',
        },
      });
      expect(result).toEqual(failedEvent);
    });

    it('should use default error message', async () => {
      const failedEvent = { ...mockBlockchainEvent, status: EventStatus.FAILED, errorMessage: 'Transaction failed' };
      service.update.mockResolvedValue(failedEvent);

      await controller.markAsFailed(mockBlockchainEvent.id, {});

      expect(service.update).toHaveBeenCalledWith(mockBlockchainEvent.id, {
        status: 'failed' as any,
        errorMessage: 'Transaction failed',
        metadata: {
          failed_at: expect.any(String),
          failed_by: 'system',
        },
      });
    });
  });

  describe('remove', () => {
    it('should remove a blockchain event', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove(mockBlockchainEvent.id);

      expect(service.remove).toHaveBeenCalledWith(mockBlockchainEvent.id);
    });

    it('should handle NotFoundException', async () => {
      service.remove.mockRejectedValue(new NotFoundException('Event not found'));

      await expect(controller.remove('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validation', () => {
    it('should validate UUID parameters', async () => {
      // This test would be handled by NestJS validation pipes in real scenarios
      // Here we just ensure the controller methods expect UUID format
      service.findOne.mockResolvedValue(mockBlockchainEvent);

      await controller.findOne('123e4567-e89b-12d3-a456-426614174000');

      expect(service.findOne).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });
  });

  describe('error handling', () => {
    it('should propagate service errors', async () => {
      const error = new Error('Service error');
      service.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Service error');
    });

    it('should handle validation errors from DTOs', async () => {
      // In real scenarios, this would be handled by NestJS validation pipes
      const invalidDto = { invalidField: 'invalid' } as any;
      service.create.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.create(invalidDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('query parameter handling', () => {
    it('should handle complex query parameters', async () => {
      const complexQuery: BlockchainEventsQueryDto = {
        assetId: 'asset-123',
        eventType: BlockchainEventType.ASSET_TRANSFER,
        status: EventStatus.CONFIRMED,
        network: BlockchainNetwork.STARKNET_MAINNET,
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-12-31T23:59:59Z',
        hasError: false,
        minConfirmations: 5,
        searchDetails: 'transfer',
        page: 2,
        limit: 50,
        sortBy: 'blockNumber',
        sortOrder: 'ASC',
      };

      const mockResponse = {
        events: [mockBlockchainEvent],
        total: 1,
        page: 2,
        limit: 50,
        totalPages: 1,
        analytics: mockAnalytics,
      };

      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(complexQuery);

      expect(service.findAll).toHaveBeenCalledWith(complexQuery);
      expect(result).toEqual(mockResponse);
    });
  });
});
