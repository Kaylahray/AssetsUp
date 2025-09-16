import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsNumberString,
  IsInt,
  Min,
  Max,
  IsUUID,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';

export class BlockchainEventsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by asset ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: BlockchainEventType,
    example: BlockchainEventType.ASSET_TRANSFER,
  })
  @IsOptional()
  @IsEnum(BlockchainEventType)
  eventType?: BlockchainEventType;

  @ApiPropertyOptional({
    description: 'Filter by transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash must be a valid StarkNet hash (0x followed by 64 hex characters)',
  })
  transactionHash?: string;

  @ApiPropertyOptional({
    description: 'Filter by block number',
    example: '123456',
  })
  @IsOptional()
  @IsNumberString()
  blockNumber?: string;

  @ApiPropertyOptional({
    description: 'Filter by blockchain network',
    enum: BlockchainNetwork,
    example: BlockchainNetwork.STARKNET_MAINNET,
  })
  @IsOptional()
  @IsEnum(BlockchainNetwork)
  network?: BlockchainNetwork;

  @ApiPropertyOptional({
    description: 'Filter by event status',
    enum: EventStatus,
    example: EventStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'Filter by event priority',
    enum: EventPriority,
    example: EventPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(EventPriority)
  priority?: EventPriority;

  @ApiPropertyOptional({
    description: 'Filter by contract address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Contract address must be a valid StarkNet address',
  })
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by from address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'From address must be a valid StarkNet address',
  })
  fromAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by to address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'To address must be a valid StarkNet address',
  })
  toAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter events from this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter events to this date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum block number',
    example: '100000',
  })
  @IsOptional()
  @IsNumberString()
  fromBlock?: string;

  @ApiPropertyOptional({
    description: 'Filter by maximum block number',
    example: '200000',
  })
  @IsOptional()
  @IsNumberString()
  toBlock?: string;

  @ApiPropertyOptional({
    description: 'Filter by minimum confirmations',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minConfirmations?: number;

  @ApiPropertyOptional({
    description: 'Filter events with errors only',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasError?: boolean;

  @ApiPropertyOptional({
    description: 'Search in event details (JSON search)',
    example: 'transfer',
  })
  @IsOptional()
  @IsString()
  searchDetails?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'timestamp',
    enum: ['timestamp', 'blockNumber', 'createdAt', 'priority', 'status'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
