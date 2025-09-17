import {
  IsString,
  IsEnum,
  IsOptional,
  IsEmail,
  IsUUID,
  IsPhoneNumber,
  IsDateString,
  IsArray,
  IsObject,
  IsInt,
  Min,
  Max,
  Length,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TicketPriority,
  TicketCategory,
  TicketSource,
} from '../feedback-support.enums';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket title',
    example: 'Unable to update asset location',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the issue or request',
    example: 'When I try to update the location of asset #12345, the system shows an error message and the changes are not saved.',
  })
  @IsString()
  @Length(1, 5000)
  description: string;

  @ApiPropertyOptional({
    description: 'Ticket priority level',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiProperty({
    description: 'User ID who created the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({
    description: 'Ticket category',
    enum: TicketCategory,
    default: TicketCategory.GENERAL_INQUIRY,
  })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({
    description: 'Source of the ticket',
    enum: TicketSource,
    default: TicketSource.WEB_PORTAL,
  })
  @IsOptional()
  @IsEnum(TicketSource)
  source?: TicketSource;

  @ApiPropertyOptional({
    description: 'Asset ID related to the ticket',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@company.com',
  })
  @IsOptional()
  @IsEmail()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  userName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Due date for ticket resolution',
    example: '2024-02-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the ticket',
    example: ['urgent', 'asset-management', 'location-update'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Custom fields for additional information',
    example: {
      department: 'IT',
      building: 'Main Office',
      floor: '3rd Floor',
    },
  })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      browser: 'Chrome 120.0',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.100',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Estimated resolution time in hours',
    example: 24,
    minimum: 1,
    maximum: 720,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  estimatedResolutionTime?: number;
}
