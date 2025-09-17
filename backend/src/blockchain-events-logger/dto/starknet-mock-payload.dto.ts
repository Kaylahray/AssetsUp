import {
  IsString,
  IsArray,
  IsObject,
  IsOptional,
  IsNumberString,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StarkNetEventLogDto {
  @ApiProperty({
    description: 'Event topics (indexed parameters)',
    example: [
      '0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9',
      '0x1234567890abcdef1234567890abcdef12345678',
      '0x9876543210fedcba9876543210fedcba98765432',
    ],
  })
  @IsArray()
  @IsString({ each: true })
  topics: string[];

  @ApiProperty({
    description: 'Event data (non-indexed parameters)',
    example: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
  })
  @IsString()
  data: string;

  @ApiProperty({
    description: 'Contract address that emitted the event',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Address must be a valid StarkNet address',
  })
  address: string;
}

export class StarkNetTransactionReceiptDto {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Transaction hash must be a valid StarkNet hash',
  })
  transaction_hash: string;

  @ApiProperty({
    description: 'Block number',
    example: '123456',
  })
  @IsNumberString()
  block_number: string;

  @ApiProperty({
    description: 'Block hash',
    example: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/, {
    message: 'Block hash must be a valid StarkNet hash',
  })
  block_hash: string;

  @ApiProperty({
    description: 'Transaction index in block',
    example: '5',
  })
  @IsNumberString()
  transaction_index: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'ACCEPTED_ON_L2',
    enum: ['PENDING', 'ACCEPTED_ON_L2', 'ACCEPTED_ON_L1', 'REJECTED'],
  })
  @IsString()
  status: string;

  @ApiProperty({
    description: 'Actual fee paid',
    example: '1234567890123456',
  })
  @IsNumberString()
  actual_fee: string;

  @ApiPropertyOptional({
    description: 'Events emitted by the transaction',
    type: [StarkNetEventLogDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StarkNetEventLogDto)
  events?: StarkNetEventLogDto[];

  @ApiPropertyOptional({
    description: 'Execution resources used',
    example: {
      n_steps: 1234,
      n_memory_holes: 56,
      builtin_instance_counter: {
        pedersen_builtin: 12,
        range_check_builtin: 34,
        ecdsa_builtin: 1,
      },
    },
  })
  @IsOptional()
  @IsObject()
  execution_resources?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Messages sent to L1',
    example: [],
  })
  @IsOptional()
  @IsArray()
  messages_sent?: any[];

  @ApiPropertyOptional({
    description: 'Revert reason if transaction failed',
    example: 'Error: insufficient balance',
  })
  @IsOptional()
  @IsString()
  revert_reason?: string;
}

export class StarkNetMockPayloadDto {
  @ApiProperty({
    description: 'Asset ID for the event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiProperty({
    description: 'Event type identifier',
    example: 'asset_transfer',
  })
  @IsString()
  eventType: string;

  @ApiProperty({
    description: 'StarkNet transaction receipt',
    type: StarkNetTransactionReceiptDto,
  })
  @ValidateNested()
  @Type(() => StarkNetTransactionReceiptDto)
  receipt: StarkNetTransactionReceiptDto;

  @ApiPropertyOptional({
    description: 'Additional event metadata',
    example: {
      asset_name: 'Laptop Dell XPS 13',
      previous_owner: 'John Doe',
      new_owner: 'Jane Smith',
      transfer_reason: 'Employee relocation',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Network identifier',
    example: 'starknet_mainnet',
    enum: ['starknet_mainnet', 'starknet_testnet', 'starknet_sepolia'],
  })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiPropertyOptional({
    description: 'Event priority',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsString()
  priority?: string;
}
