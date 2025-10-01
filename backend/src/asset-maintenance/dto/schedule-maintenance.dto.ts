import { IsUUID, IsDateString, IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType } from '../entities/asset-maintenance.entity';

export class ScheduleMaintenanceDto {
  @ApiProperty({ description: 'UUID of the asset', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: 'Scheduled maintenance date (ISO format)', example: '2024-02-01T09:00:00.000Z' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ enum: MaintenanceType, description: 'Type of maintenance to be performed' })
  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @ApiPropertyOptional({ description: 'Maintenance notes', example: 'Routine preventive maintenance' })
  @IsString()
  @IsOptional()
  notes?: string;
}