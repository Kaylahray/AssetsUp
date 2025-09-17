import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsObject,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsUUID,
} from 'class-validator';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '../feedback-support.enums';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @ApiPropertyOptional({
    description: 'Update ticket status',
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Assign ticket to a user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Resolution details',
    example: 'Issue was resolved by updating the database permissions.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution?: string;

  @ApiPropertyOptional({
    description: 'Internal notes (not visible to customer)',
    example: 'Customer called twice about this issue. Escalated to senior developer.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internalNotes?: string;

  @ApiPropertyOptional({
    description: 'Customer satisfaction rating (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  customerSatisfactionRating?: number;

  @ApiPropertyOptional({
    description: 'Actual resolution time in hours',
    example: 6,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualResolutionTime?: number;

  @ApiPropertyOptional({
    description: 'First response timestamp',
    example: '2024-01-15T11:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  firstResponseAt?: string;

  @ApiPropertyOptional({
    description: 'Last activity timestamp',
    example: '2024-01-15T15:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  lastActivityAt?: string;
}
