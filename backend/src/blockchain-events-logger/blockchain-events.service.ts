import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual, Like, IsNull, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BlockchainEvent } from './entities/blockchain-event.entity';
import { CreateBlockchainEventDto } from './dto/create-blockchain-event.dto';
import { UpdateBlockchainEventDto } from './dto/update-blockchain-event.dto';
import { BlockchainEventsQueryDto } from './dto/blockchain-events-query.dto';
import { StarkNetMockPayloadDto } from './dto/starknet-mock-payload.dto';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from './blockchain-events.enums';

@Injectable()
export class BlockchainEventsService {
  private readonly logger = new Logger(BlockchainEventsService.name);

  constructor(
    @InjectRepository(BlockchainEvent)
    private readonly blockchainEventRepository: Repository<BlockchainEvent>,
  ) {}

  async create(createBlockchainEventDto: CreateBlockchainEventDto): Promise<BlockchainEvent> {
    try {
      // Check for duplicate transaction hash
      const existingEvent = await this.blockchainEventRepository.findOne({
        where: { transactionHash: createBlockchainEventDto.transactionHash },
      });

      if (existingEvent) {
        throw new ConflictException(
          `Blockchain event with transaction hash ${createBlockchainEventDto.transactionHash} already exists`,
        );
      }

      const blockchainEvent = this.blockchainEventRepository.create({
        ...createBlockchainEventDto,
        timestamp: new Date(createBlockchainEventDto.timestamp),
        network: createBlockchainEventDto.network || BlockchainNetwork.STARKNET_MAINNET,
        status: createBlockchainEventDto.status || EventStatus.PENDING,
        priority: createBlockchainEventDto.priority || EventPriority.MEDIUM,
        confirmations: createBlockchainEventDto.confirmations || 0,
      });

      const savedEvent = await this.blockchainEventRepository.save(blockchainEvent);
      this.logger.log(`Created blockchain event: ${savedEvent.id} for transaction: ${savedEvent.transactionHash}`);
      
      return savedEvent;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to create blockchain event: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create blockchain event');
    }
  }

  async createFromStarkNetPayload(payload: StarkNetMockPayloadDto): Promise<BlockchainEvent> {
    try {
      const { receipt, assetId, eventType, metadata, network, priority } = payload;

      // Map StarkNet event type to our enum
      const mappedEventType = this.mapEventType(eventType);
      
      // Determine status from StarkNet receipt
      const status = this.mapStarkNetStatus(receipt.status);

      // Extract gas information
      const gasUsed = receipt.execution_resources?.n_steps?.toString();
      const gasPrice = '1'; // StarkNet uses steps, not gas price like Ethereum

      // Create event details from StarkNet data
      const eventDetails = {
        starknet_status: receipt.status,
        block_hash: receipt.block_hash,
        transaction_index: receipt.transaction_index,
        actual_fee: receipt.actual_fee,
        execution_resources: receipt.execution_resources,
        events: receipt.events,
        messages_sent: receipt.messages_sent,
        ...metadata,
      };

      const createDto: CreateBlockchainEventDto = {
        assetId,
        eventType: mappedEventType,
        transactionHash: receipt.transaction_hash,
        blockNumber: receipt.block_number,
        timestamp: new Date().toISOString(), // Use current time as StarkNet doesn't provide timestamp in receipt
        eventDetails,
        network: this.mapNetwork(network) || BlockchainNetwork.STARKNET_MAINNET,
        status,
        priority: this.mapPriority(priority) || EventPriority.MEDIUM,
        gasUsed,
        gasPrice,
        rawEventData: receipt,
        errorMessage: receipt.revert_reason,
        confirmations: status === EventStatus.CONFIRMED ? 1 : 0,
        metadata: {
          source: 'starknet_mock_payload',
          processed_at: new Date().toISOString(),
          ...metadata,
        },
      };

      return await this.create(createDto);
    } catch (error) {
      this.logger.error(`Failed to create event from StarkNet payload: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to process StarkNet payload');
    }
  }

  async findAll(query: BlockchainEventsQueryDto): Promise<{
    events: BlockchainEvent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    analytics: any;
  }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'DESC',
      ...filters
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (filters.assetId) where.assetId = filters.assetId;
    if (filters.eventType) where.eventType = filters.eventType;
    if (filters.transactionHash) where.transactionHash = filters.transactionHash;
    if (filters.blockNumber) where.blockNumber = filters.blockNumber;
    if (filters.network) where.network = filters.network;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.contractAddress) where.contractAddress = filters.contractAddress;
    if (filters.fromAddress) where.fromAddress = filters.fromAddress;
    if (filters.toAddress) where.toAddress = filters.toAddress;

    // Date range filtering
    if (filters.fromDate && filters.toDate) {
      where.timestamp = Between(new Date(filters.fromDate), new Date(filters.toDate));
    } else if (filters.fromDate) {
      where.timestamp = MoreThanOrEqual(new Date(filters.fromDate));
    } else if (filters.toDate) {
      where.timestamp = LessThanOrEqual(new Date(filters.toDate));
    }

    // Block range filtering
    if (filters.fromBlock && filters.toBlock) {
      where.blockNumber = Between(filters.fromBlock, filters.toBlock);
    } else if (filters.fromBlock) {
      where.blockNumber = MoreThanOrEqual(filters.fromBlock);
    } else if (filters.toBlock) {
      where.blockNumber = LessThanOrEqual(filters.toBlock);
    }

    // Confirmations filtering
    if (filters.minConfirmations !== undefined) {
      where.confirmations = MoreThanOrEqual(filters.minConfirmations);
    }

    // Error filtering
    if (filters.hasError !== undefined) {
      where.errorMessage = filters.hasError ? Not(IsNull()) : IsNull();
    }

    const findOptions: FindManyOptions<BlockchainEvent> = {
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    };

    // Text search in event details
    if (filters.searchDetails) {
      delete findOptions.where;
      const searchQuery = this.blockchainEventRepository
        .createQueryBuilder('event')
        .where(where)
        .andWhere(
          "event.eventDetails::text ILIKE :search OR event.metadata::text ILIKE :search",
          { search: `%${filters.searchDetails}%` }
        )
        .skip(skip)
        .take(limit)
        .orderBy(`event.${sortBy}`, sortOrder);

      const [events, total] = await searchQuery.getManyAndCount();
      const analytics = await this.getAnalytics(filters);

      return {
        events,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        analytics,
      };
    }

    const [events, total] = await this.blockchainEventRepository.findAndCount(findOptions);
    const analytics = await this.getAnalytics(filters);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      analytics,
    };
  }

  async findOne(id: string): Promise<BlockchainEvent> {
    const event = await this.blockchainEventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Blockchain event with ID ${id} not found`);
    }

    return event;
  }

  async findByTransactionHash(transactionHash: string): Promise<BlockchainEvent> {
    const event = await this.blockchainEventRepository.findOne({
      where: { transactionHash },
    });

    if (!event) {
      throw new NotFoundException(`Blockchain event with transaction hash ${transactionHash} not found`);
    }

    return event;
  }

  async findByAssetId(assetId: string, query?: Partial<BlockchainEventsQueryDto>): Promise<BlockchainEvent[]> {
    const where: any = { assetId };
    
    if (query?.eventType) where.eventType = query.eventType;
    if (query?.status) where.status = query.status;
    if (query?.network) where.network = query.network;

    return await this.blockchainEventRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: query?.limit || 50,
    });
  }

  async findByEventType(eventType: BlockchainEventType, query?: Partial<BlockchainEventsQueryDto>): Promise<BlockchainEvent[]> {
    const where: any = { eventType };
    
    if (query?.assetId) where.assetId = query.assetId;
    if (query?.status) where.status = query.status;
    if (query?.network) where.network = query.network;

    return await this.blockchainEventRepository.find({
      where,
      order: { timestamp: 'DESC' },
      take: query?.limit || 50,
    });
  }

  async update(id: string, updateBlockchainEventDto: UpdateBlockchainEventDto): Promise<BlockchainEvent> {
    const event = await this.findOne(id);

    // Merge existing metadata with new metadata
    if (updateBlockchainEventDto.metadata && event.metadata) {
      updateBlockchainEventDto.metadata = {
        ...event.metadata,
        ...updateBlockchainEventDto.metadata,
        updated_at: new Date().toISOString(),
      };
    }

    Object.assign(event, updateBlockchainEventDto);
    const updatedEvent = await this.blockchainEventRepository.save(event);
    
    this.logger.log(`Updated blockchain event: ${id}`);
    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.blockchainEventRepository.remove(event);
    this.logger.log(`Deleted blockchain event: ${id}`);
  }

  async getAnalytics(filters?: Partial<BlockchainEventsQueryDto>): Promise<any> {
    const baseQuery = this.blockchainEventRepository.createQueryBuilder('event');

    // Apply filters to analytics query
    if (filters?.assetId) baseQuery.andWhere('event.assetId = :assetId', { assetId: filters.assetId });
    if (filters?.eventType) baseQuery.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
    if (filters?.network) baseQuery.andWhere('event.network = :network', { network: filters.network });
    if (filters?.fromDate) baseQuery.andWhere('event.timestamp >= :fromDate', { fromDate: filters.fromDate });
    if (filters?.toDate) baseQuery.andWhere('event.timestamp <= :toDate', { toDate: filters.toDate });

    const [
      totalEvents,
      eventsByStatus,
      eventsByType,
      eventsByNetwork,
      eventsByPriority,
      recentEvents,
      failedEvents,
    ] = await Promise.all([
      baseQuery.getCount(),
      baseQuery.select('event.status, COUNT(*) as count').groupBy('event.status').getRawMany(),
      baseQuery.select('event.eventType, COUNT(*) as count').groupBy('event.eventType').getRawMany(),
      baseQuery.select('event.network, COUNT(*) as count').groupBy('event.network').getRawMany(),
      baseQuery.select('event.priority, COUNT(*) as count').groupBy('event.priority').getRawMany(),
      this.blockchainEventRepository.find({
        order: { timestamp: 'DESC' },
        take: 5,
      }),
      baseQuery.andWhere('event.errorMessage IS NOT NULL').getCount(),
    ]);

    return {
      totalEvents,
      eventsByStatus: eventsByStatus.reduce((acc, item) => {
        acc[item.event_status] = parseInt(item.count);
        return acc;
      }, {}),
      eventsByType: eventsByType.reduce((acc, item) => {
        acc[item.event_eventType] = parseInt(item.count);
        return acc;
      }, {}),
      eventsByNetwork: eventsByNetwork.reduce((acc, item) => {
        acc[item.event_network] = parseInt(item.count);
        return acc;
      }, {}),
      eventsByPriority: eventsByPriority.reduce((acc, item) => {
        acc[item.event_priority] = parseInt(item.count);
        return acc;
      }, {}),
      recentEvents,
      failedEvents,
      successRate: totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents * 100).toFixed(2) : 0,
    };
  }

  // Cron job to update event confirmations (runs every 5 minutes)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateEventConfirmations(): Promise<void> {
    try {
      const pendingEvents = await this.blockchainEventRepository.find({
        where: { status: EventStatus.PENDING },
        take: 100, // Process in batches
      });

      for (const event of pendingEvents) {
        // Simulate confirmation logic (in real implementation, this would query the blockchain)
        const confirmations = Math.floor(Math.random() * 20) + 1;
        
        if (confirmations >= 12) {
          event.status = EventStatus.CONFIRMED;
          event.confirmations = confirmations;
          await this.blockchainEventRepository.save(event);
          this.logger.log(`Event ${event.id} confirmed with ${confirmations} confirmations`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update event confirmations: ${error.message}`, error.stack);
    }
  }

  // Helper methods
  private mapEventType(eventType: string): BlockchainEventType {
    const typeMap: Record<string, BlockchainEventType> = {
      'asset_transfer': BlockchainEventType.ASSET_TRANSFER,
      'asset_purchase': BlockchainEventType.ASSET_PURCHASE,
      'asset_disposal': BlockchainEventType.ASSET_DISPOSAL,
      'asset_creation': BlockchainEventType.ASSET_CREATION,
      'asset_update': BlockchainEventType.ASSET_UPDATE,
      'asset_maintenance': BlockchainEventType.ASSET_MAINTENANCE,
      'asset_audit': BlockchainEventType.ASSET_AUDIT,
      'asset_depreciation': BlockchainEventType.ASSET_DEPRECIATION,
      'asset_insurance_claim': BlockchainEventType.ASSET_INSURANCE_CLAIM,
      'asset_warranty_claim': BlockchainEventType.ASSET_WARRANTY_CLAIM,
      'contract_deployment': BlockchainEventType.CONTRACT_DEPLOYMENT,
      'contract_upgrade': BlockchainEventType.CONTRACT_UPGRADE,
    };

    return typeMap[eventType] || BlockchainEventType.ASSET_UPDATE;
  }

  private mapStarkNetStatus(status: string): EventStatus {
    const statusMap: Record<string, EventStatus> = {
      'PENDING': EventStatus.PENDING,
      'ACCEPTED_ON_L2': EventStatus.CONFIRMED,
      'ACCEPTED_ON_L1': EventStatus.CONFIRMED,
      'REJECTED': EventStatus.FAILED,
    };

    return statusMap[status] || EventStatus.PENDING;
  }

  private mapNetwork(network?: string): BlockchainNetwork | undefined {
    if (!network) return undefined;

    const networkMap: Record<string, BlockchainNetwork> = {
      'starknet_mainnet': BlockchainNetwork.STARKNET_MAINNET,
      'starknet_testnet': BlockchainNetwork.STARKNET_TESTNET,
      'starknet_sepolia': BlockchainNetwork.STARKNET_SEPOLIA,
    };

    return networkMap[network];
  }

  private mapPriority(priority?: string): EventPriority | undefined {
    if (!priority) return undefined;

    const priorityMap: Record<string, EventPriority> = {
      'low': EventPriority.LOW,
      'medium': EventPriority.MEDIUM,
      'high': EventPriority.HIGH,
      'critical': EventPriority.CRITICAL,
    };

    return priorityMap[priority];
  }
}
