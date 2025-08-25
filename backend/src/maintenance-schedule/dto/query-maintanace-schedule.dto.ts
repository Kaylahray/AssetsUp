import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { Transform } from "class-transformer";
import {
  MaintenanceFrequency,
  ScheduleStatus,
} from "../entities/maintenance-schedule.entity/maintenance-schedule.entity";

export class QueryMaintenanceScheduleDto {
  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  assetName?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @IsEnum(MaintenanceFrequency)
  frequency?: MaintenanceFrequency;

  @IsOptional()
  @IsDateString()
  dueBefore?: string;

  @IsOptional()
  @IsDateString()
  dueAfter?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
