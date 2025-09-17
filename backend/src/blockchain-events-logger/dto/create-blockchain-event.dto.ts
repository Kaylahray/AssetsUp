import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsObject,
  IsNumberString,
  IsInt,
  Min,
  Max,
  Matches,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BlockchainEventType,
  BlockchainNetwork,
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';

export class CreateBlockchainEventDto {
  @ApiPropertyOptional({
    description: 'Asset ID associated with the blockchain event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiProperty({
    description: 'Type of blockchain event',
    enum: BlockchainEventType,
    example: BlockchainEventType.ASSET_TRANSFER,
  })
  @IsEnum(BlockchainEventType)
  eventType: BlockchainEventType;

  @ApiProperty({
    description: 'StarkNet transaction hash (0x followed by 64 hex characters)',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash must be a valid StarkNet hash (0x followed by 64 hex characters)',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'Block number where the event occurred',
    example: '123456',
  })
  @IsNumberString()
  blockNumber: string;

  @ApiProperty({
    description: 'Timestamp when the event occurred',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Additional event details and metadata',
    example: {
      amount: '1000000000000000000',
      tokenId: '42',
      previousOwner: '0x123...',
      newOwner: '0x456...',
    },
  })
  @IsOptional()
  @IsObject()
  eventDetails?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Blockchain network',
    enum: BlockchainNetwork,
    default: BlockchainNetwork.STARKNET_MAINNET,
  })
  @IsOptional()
  @IsEnum(BlockchainNetwork)
  network?: BlockchainNetwork;

  @ApiPropertyOptional({
    description: 'Event status',
    enum: EventStatus,
    default: EventStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'Event priority level',
    enum: EventPriority,
    default: EventPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(EventPriority)
  priority?: EventPriority;

  @ApiPropertyOptional({
    description: 'Smart contract address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Contract address must be a valid StarkNet address (0x followed by 40 hex characters)',
  })
  contractAddress?: string;

  @ApiPropertyOptional({
    description: 'From address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'From address must be a valid StarkNet address (0x followed by 40 hex characters)',
  })
  fromAddress?: string;

  @ApiPropertyOptional({
    description: 'To address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsOptional()
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'To address must be a valid StarkNet address (0x followed by 40 hex characters)',
  })
  toAddress?: string;

  @ApiPropertyOptional({
    description: 'Gas used for the transaction',
    example: '21000',
  })
  @IsOptional()
  @IsNumberString()
  gasUsed?: string;

  @ApiPropertyOptional({
    description: 'Gas price for the transaction',
    example: '20000000000',
  })
  @IsOptional()
  @IsNumberString()
  gasPrice?: string;

  @ApiPropertyOptional({
    description: 'Event signature',
    example: 'Transfer(address,address,uint256)',
  })
  @IsOptional()
  @IsString()
  eventSignature?: string;

  @ApiPropertyOptional({
    description: 'Raw event data from the blockchain',
    example: {
      topics: ['0x...', '0x...'],
      data: '0x...',
    },
  })
  @IsOptional()
  @IsObject()
  rawEventData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Error message if the event failed',
    example: 'Transaction reverted: insufficient balance',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Number of confirmations',
    example: 12,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  confirmations?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      source: 'starknet_indexer',
      version: '1.0.0',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
