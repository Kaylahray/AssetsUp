import { IsUUID, IsDateString, IsEnum, IsString, IsOptional } from 'class-validator';
import { MaintenanceType } from '../entities/asset-maintenance.entity';

export class ScheduleMaintenanceDto {
  @IsUUID()
  assetId: string;

  @IsDateString()
  scheduledDate: string;

  @IsEnum(MaintenanceType)
  maintenanceType: MaintenanceType;

  @IsString()
  @IsOptional()
  notes?: string;
}