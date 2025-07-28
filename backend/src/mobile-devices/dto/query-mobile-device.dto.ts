import { IsOptional, IsEnum, IsString, IsUUID, IsDateString } from "class-validator";
import { Transform } from "class-transformer";
import { MobileDeviceStatus, MobileDeviceType, OperatingSystem } from "../entities/mobile-device.entity";

export class QueryMobileDeviceDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MobileDeviceStatus)
  status?: MobileDeviceStatus;

  @IsOptional()
  @IsEnum(MobileDeviceType)
  deviceType?: MobileDeviceType;

  @IsOptional()
  @IsEnum(OperatingSystem)
  operatingSystem?: OperatingSystem;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  manufacturer?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsDateString()
  warrantyExpiryBefore?: string;

  @IsOptional()
  @IsDateString()
  warrantyExpiryAfter?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiryBefore?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiryAfter?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";
} 