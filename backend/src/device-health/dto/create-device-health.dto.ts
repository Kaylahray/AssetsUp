import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceStatus, DeviceType } from '../entities/device-health.entity';

export class CreateDeviceHealthDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  deviceName: string;

  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @IsEnum(DeviceStatus)
  status: DeviceStatus;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(150)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  cpuUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  memoryUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  diskUsage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @IsOptional()
  @IsBoolean()
  networkConnected?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  errorCount?: number;

  @IsOptional()
  @IsArray()
  logs?: Record<string, any>[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class DeviceHealthQueryDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class DeviceHealthStatsDto {
  totalDevices: number;
  healthyDevices: number;
  warningDevices: number;
  criticalDevices: number;
  offlineDevices: number;
  averageTemperature: number;
  averageCpuUsage: number;
  averageMemoryUsage: number;
  devicesWithErrors: number;
}