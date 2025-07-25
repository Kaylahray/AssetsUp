import { IsString, IsEnum, IsObject, IsOptional, IsArray, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChangeLogAction } from '../entities/change-log.entity';
import { Transform } from 'class-transformer';

export class CreateChangeLogDto {
  @ApiProperty({ description: 'Type of entity that was changed', example: 'User' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'ID of the entity that was changed', example: 'uuid-123' })
  @IsString()
  entityId: string;

  @ApiProperty({ enum: ChangeLogAction, description: 'Type of action performed' })
  @IsEnum(ChangeLogAction)
  action: ChangeLogAction;

  @ApiProperty({ description: 'ID of the user who made the change', example: 'user-uuid-456' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Name of the user who made the change', example: 'John Doe' })
  @IsString()
  userName: string;

  @ApiPropertyOptional({ description: 'Values before the change' })
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Values after the change' })
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @ApiPropertyOptional({ description: 'List of fields that were changed', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFields?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata', })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IP address of the user', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent of the client', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class FilterChangeLogDto {
  @ApiPropertyOptional({ description: 'Filter by entity type', example: 'User' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID', example: 'uuid-123' })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID', example: 'user-uuid-456' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: ChangeLogAction, description: 'Filter by action type' })
  @IsOptional()
  @IsEnum(ChangeLogAction)
  action?: ChangeLogAction;

  @ApiPropertyOptional({ description: 'Filter changes from this date', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter changes to this date', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;
}