import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsPositive,
  Min,
  Max,
  ValidateIf,
} from "class-validator";
import { MaintenanceFrequency } from "../entities/maintenance-schedule.entity/maintenance-schedule.entity";

export class CreateMaintenanceScheduleDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  assetName?: string;

  @IsEnum(MaintenanceFrequency)
  frequency: MaintenanceFrequency;

  @ValidateIf((o) => o.frequency === MaintenanceFrequency.CUSTOM)
  @IsNumber()
  @IsPositive()
  customIntervalDays?: number;

  @IsDateString()
  nextMaintenanceDate: string;

  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  maintenanceDescription?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  estimatedDurationHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  priorityLevel?: number;
}
