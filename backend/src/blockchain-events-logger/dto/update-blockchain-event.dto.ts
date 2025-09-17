import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsObject,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import {
  EventStatus,
  EventPriority,
} from '../blockchain-events.enums';
import { CreateBlockchainEventDto } from './create-blockchain-event.dto';

export class UpdateBlockchainEventDto extends PartialType(CreateBlockchainEventDto) {
  @ApiPropertyOptional({
    description: 'Update event status',
    enum: EventStatus,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'Update event priority',
    enum: EventPriority,
  })
  @IsOptional()
  @IsEnum(EventPriority)
  priority?: EventPriority;

  @ApiPropertyOptional({
    description: 'Update error message',
    example: 'Transaction failed: insufficient gas',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Update number of confirmations',
    example: 15,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  confirmations?: number;

  @ApiPropertyOptional({
    description: 'Update additional metadata',
    example: {
      updated_by: 'system',
      reason: 'status_change',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
