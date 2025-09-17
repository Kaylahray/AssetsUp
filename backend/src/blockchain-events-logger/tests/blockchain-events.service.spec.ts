import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { BlockchainEventsService } from '../blockchain-events.service';
import { BlockchainEvent } from '../entities/blockchain-event.entity';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';
import { CreateBlockchainEventDto } from '../dto/create-blockchain-event.dto';
import { UpdateBlockchainEventDto } from '../dto/update-blockchain-event.dto';
import { StarkNetMockPayloadDto } from '../dto/starknet-mock-payload.dto';

describe('BlockchainEventsService', () => {
  let service: BlockchainEventsService;
  let repository: jest.Mocked<Repository<BlockchainEvent>>;

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

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainEventsService,
        {
          provide: getRepositoryToken(BlockchainEvent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BlockchainEventsService>(BlockchainEventsService);
    repository = module.get(getRepositoryToken(BlockchainEvent));
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

    it('should create a blockchain event successfully', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockBlockchainEvent);
      repository.save.mockResolvedValue(mockBlockchainEvent);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { transactionHash: createDto.transactionHash },
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        timestamp: new Date(createDto.timestamp),
        network: BlockchainNetwork.STARKNET_MAINNET,
        status: EventStatus.PENDING,
        priority: EventPriority.MEDIUM,
        confirmations: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(mockBlockchainEvent);
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should throw ConflictException if transaction hash already exists', async () => {
      repository.findOne.mockResolvedValue(mockBlockchainEvent);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException on database error', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockBlockchainEvent);
      repository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('createFromStarkNetPayload', () => {
    it('should create blockchain event from StarkNet payload', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockBlockchainEvent);
      repository.save.mockResolvedValue(mockBlockchainEvent);

      const result = await service.createFromStarkNetPayload(mockStarkNetPayload);

      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should handle StarkNet payload with revert reason', async () => {
      const failedPayload = {
        ...mockStarkNetPayload,
        receipt: {
          ...mockStarkNetPayload.receipt,
          status: 'REJECTED',
          revert_reason: 'Transaction failed: insufficient balance',
        },
      };

      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue({
        ...mockBlockchainEvent,
        status: EventStatus.FAILED,
        errorMessage: 'Transaction failed: insufficient balance',
      });
      repository.save.mockResolvedValue({
        ...mockBlockchainEvent,
        status: EventStatus.FAILED,
        errorMessage: 'Transaction failed: insufficient balance',
      });

      const result = await service.createFromStarkNetPayload(failedPayload);

      expect(result.status).toBe(EventStatus.FAILED);
      expect(result.errorMessage).toBe('Transaction failed: insufficient balance');
    });

    it('should throw BadRequestException on invalid payload', async () => {
      const invalidPayload = { ...mockStarkNetPayload, receipt: null };

      await expect(service.createFromStarkNetPayload(invalidPayload as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };

    it('should return paginated blockchain events with analytics', async () => {
      const mockEvents = [mockBlockchainEvent];
      const mockTotal = 1;
      const mockAnalytics = {
        totalEvents: 1,
        eventsByStatus: { confirmed: 1 },
        eventsByType: { asset_transfer: 1 },
        eventsByNetwork: { starknet_mainnet: 1 },
        eventsByPriority: { medium: 1 },
        recentEvents: [mockBlockchainEvent],
        failedEvents: 0,
        successRate: '100.00',
      };

      repository.findAndCount.mockResolvedValue([mockEvents, mockTotal]);
      jest.spyOn(service, 'getAnalytics').mockResolvedValue(mockAnalytics);

      const result = await service.findAll({
        page: 1,
        limit: 20,
        sortBy: 'timestamp',
        sortOrder: 'DESC',
      });

      expect(result).toEqual({
        events: mockEvents,
        total: mockTotal,
        page: 1,
        limit: 20,
        totalPages: 1,
        analytics: mockAnalytics,
      });
    });

    it('should handle search in event details', async () => {
      const mockEvents = [mockBlockchainEvent];
      const mockTotal = 1;

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockEvents, mockTotal]);
      jest.spyOn(service, 'getAnalytics').mockResolvedValue({});

      const result = await service.findAll({
        searchDetails: 'transfer',
        page: 1,
        limit: 20,
      });

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('event');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "event.eventDetails::text ILIKE :search OR event.metadata::text ILIKE :search",
        { search: '%transfer%' }
      );
      expect(result.events).toEqual(mockEvents);
    });

    it('should apply filters correctly', async () => {
      const mockEvents = [mockBlockchainEvent];
      const mockTotal = 1;

      repository.findAndCount.mockResolvedValue([mockEvents, mockTotal]);
      jest.spyOn(service, 'getAnalytics').mockResolvedValue({});

      await service.findAll({
        assetId: 'asset-123',
        eventType: BlockchainEventType.ASSET_TRANSFER,
        status: EventStatus.CONFIRMED,
        network: BlockchainNetwork.STARKNET_MAINNET,
        fromDate: '2024-01-01T00:00:00Z',
        toDate: '2024-12-31T23:59:59Z',
        hasError: false,
        minConfirmations: 5,
      });

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assetId: 'asset-123',
            eventType: BlockchainEventType.ASSET_TRANSFER,
            status: EventStatus.CONFIRMED,
            network: BlockchainNetwork.STARKNET_MAINNET,
          }),
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a blockchain event by ID', async () => {
      repository.findOne.mockResolvedValue(mockBlockchainEvent);

      const result = await service.findOne(mockBlockchainEvent.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockBlockchainEvent.id },
      });
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTransactionHash', () => {
    it('should return a blockchain event by transaction hash', async () => {
      repository.findOne.mockResolvedValue(mockBlockchainEvent);

      const result = await service.findByTransactionHash(mockBlockchainEvent.transactionHash);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { transactionHash: mockBlockchainEvent.transactionHash },
      });
      expect(result).toEqual(mockBlockchainEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByTransactionHash('non-existent-hash')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAssetId', () => {
    it('should return blockchain events for an asset', async () => {
      const mockEvents = [mockBlockchainEvent];
      repository.find.mockResolvedValue(mockEvents);

      const result = await service.findByAssetId('asset-123');

      expect(repository.find).toHaveBeenCalledWith({
        where: { assetId: 'asset-123' },
        order: { timestamp: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockEvents);
    });

    it('should apply additional filters', async () => {
      const mockEvents = [mockBlockchainEvent];
      repository.find.mockResolvedValue(mockEvents);

      await service.findByAssetId('asset-123', {
        eventType: BlockchainEventType.ASSET_TRANSFER,
        status: EventStatus.CONFIRMED,
        limit: 10,
      });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          assetId: 'asset-123',
          eventType: BlockchainEventType.ASSET_TRANSFER,
          status: EventStatus.CONFIRMED,
        },
        order: { timestamp: 'DESC' },
        take: 10,
      });
    });
  });

  describe('findByEventType', () => {
    it('should return blockchain events by event type', async () => {
      const mockEvents = [mockBlockchainEvent];
      repository.find.mockResolvedValue(mockEvents);

      const result = await service.findByEventType(BlockchainEventType.ASSET_TRANSFER);

      expect(repository.find).toHaveBeenCalledWith({
        where: { eventType: BlockchainEventType.ASSET_TRANSFER },
        order: { timestamp: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('update', () => {
    const updateDto: UpdateBlockchainEventDto = {
      status: EventStatus.CONFIRMED,
      confirmations: 15,
      metadata: { updated_by: 'test' },
    };

    it('should update a blockchain event', async () => {
      const updatedEvent = { ...mockBlockchainEvent, ...updateDto };
      repository.findOne.mockResolvedValue(mockBlockchainEvent);
      repository.save.mockResolvedValue(updatedEvent);

      const result = await service.update(mockBlockchainEvent.id, updateDto);

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockBlockchainEvent,
          ...updateDto,
          metadata: expect.objectContaining({
            source: 'test',
            updated_by: 'test',
            updated_at: expect.any(String),
          }),
        })
      );
      expect(result).toEqual(updatedEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a blockchain event', async () => {
      repository.findOne.mockResolvedValue(mockBlockchainEvent);
      repository.remove.mockResolvedValue(mockBlockchainEvent);

      await service.remove(mockBlockchainEvent.id);

      expect(repository.remove).toHaveBeenCalledWith(mockBlockchainEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAnalytics', () => {
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn(),
      select: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };

    it('should return comprehensive analytics', async () => {
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValueOnce(100); // totalEvents
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ event_status: 'confirmed', count: '80' }]) // eventsByStatus
        .mockResolvedValueOnce([{ event_eventType: 'asset_transfer', count: '50' }]) // eventsByType
        .mockResolvedValueOnce([{ event_network: 'starknet_mainnet', count: '100' }]) // eventsByNetwork
        .mockResolvedValueOnce([{ event_priority: 'medium', count: '60' }]); // eventsByPriority
      
      repository.find.mockResolvedValue([mockBlockchainEvent]); // recentEvents
      mockQueryBuilder.getCount.mockResolvedValueOnce(5); // failedEvents

      const result = await service.getAnalytics();

      expect(result).toEqual({
        totalEvents: 100,
        eventsByStatus: { confirmed: 80 },
        eventsByType: { asset_transfer: 50 },
        eventsByNetwork: { starknet_mainnet: 100 },
        eventsByPriority: { medium: 60 },
        recentEvents: [mockBlockchainEvent],
        failedEvents: 5,
        successRate: '95.00',
      });
    });

    it('should handle zero events', async () => {
      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      repository.find.mockResolvedValue([]);

      const result = await service.getAnalytics();

      expect(result.totalEvents).toBe(0);
      expect(result.successRate).toBe(0);
    });
  });

  describe('helper methods', () => {
    it('should map event types correctly', () => {
      const service = new BlockchainEventsService(repository);
      
      // Access private method through any type casting for testing
      const mapEventType = (service as any).mapEventType;
      
      expect(mapEventType('asset_transfer')).toBe(BlockchainEventType.ASSET_TRANSFER);
      expect(mapEventType('asset_purchase')).toBe(BlockchainEventType.ASSET_PURCHASE);
      expect(mapEventType('unknown_type')).toBe(BlockchainEventType.ASSET_UPDATE);
    });

    it('should map StarkNet status correctly', () => {
      const service = new BlockchainEventsService(repository);
      
      const mapStarkNetStatus = (service as any).mapStarkNetStatus;
      
      expect(mapStarkNetStatus('PENDING')).toBe(EventStatus.PENDING);
      expect(mapStarkNetStatus('ACCEPTED_ON_L2')).toBe(EventStatus.CONFIRMED);
      expect(mapStarkNetStatus('ACCEPTED_ON_L1')).toBe(EventStatus.CONFIRMED);
      expect(mapStarkNetStatus('REJECTED')).toBe(EventStatus.FAILED);
      expect(mapStarkNetStatus('UNKNOWN')).toBe(EventStatus.PENDING);
    });

    it('should map networks correctly', () => {
      const service = new BlockchainEventsService(repository);
      
      const mapNetwork = (service as any).mapNetwork;
      
      expect(mapNetwork('starknet_mainnet')).toBe(BlockchainNetwork.STARKNET_MAINNET);
      expect(mapNetwork('starknet_testnet')).toBe(BlockchainNetwork.STARKNET_TESTNET);
      expect(mapNetwork('starknet_sepolia')).toBe(BlockchainNetwork.STARKNET_SEPOLIA);
      expect(mapNetwork('unknown')).toBeUndefined();
    });

    it('should map priorities correctly', () => {
      const service = new BlockchainEventsService(repository);
      
      const mapPriority = (service as any).mapPriority;
      
      expect(mapPriority('low')).toBe(EventPriority.LOW);
      expect(mapPriority('medium')).toBe(EventPriority.MEDIUM);
      expect(mapPriority('high')).toBe(EventPriority.HIGH);
      expect(mapPriority('critical')).toBe(EventPriority.CRITICAL);
      expect(mapPriority('unknown')).toBeUndefined();
    });
  });

  describe('updateEventConfirmations cron job', () => {
    it('should update pending events confirmations', async () => {
      const pendingEvent = { ...mockBlockchainEvent, status: EventStatus.PENDING, confirmations: 0 };
      repository.find.mockResolvedValue([pendingEvent]);
      repository.save.mockResolvedValue({ ...pendingEvent, status: EventStatus.CONFIRMED, confirmations: 15 });

      await service.updateEventConfirmations();

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: EventStatus.PENDING },
        take: 100,
      });
    });

    it('should handle errors in cron job gracefully', async () => {
      repository.find.mockRejectedValue(new Error('Database error'));

      // Should not throw
      await expect(service.updateEventConfirmations()).resolves.toBeUndefined();
    });
  });
});
