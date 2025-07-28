import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsUUID,
  Length,
  Min,
  Max,
} from "class-validator";
import { MobileDeviceType, OperatingSystem, MobileDeviceStatus } from "../entities/mobile-device.entity";

export class CreateMobileDeviceDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  model: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  @Length(15, 15)
  imei: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  serialNumber: string;

  @IsEnum(MobileDeviceType)
  @IsOptional()
  deviceType?: MobileDeviceType;

  @IsEnum(OperatingSystem)
  @IsNotEmpty()
  operatingSystem: OperatingSystem;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  osVersion: string;

  @IsEnum(MobileDeviceStatus)
  @IsOptional()
  status?: MobileDeviceStatus;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  simCardNumber?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  carrier?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  dataPlan?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  purchasePrice?: number;

  @IsString()
  @IsOptional()
  @Length(1, 10)
  purchaseCurrency?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  warrantyProvider?: string;

  @IsString()
  @IsOptional()
  warrantyTerms?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  insuranceProvider?: string;

  @IsDateString()
  @IsOptional()
  insuranceExpiry?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  insuranceValue?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  location?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  department?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  lastMaintenanceDate?: string;

  @IsDateString()
  @IsOptional()
  nextMaintenanceDate?: string;

  @IsDateString()
  @IsOptional()
  lastOsUpdate?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  currentOsVersion?: string;

  @IsBoolean()
  @IsOptional()
  isOsUpdateAvailable?: boolean;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  availableOsVersion?: string;

  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @IsDateString()
  @IsOptional()
  assignedDate?: string;

  @IsString()
  @IsOptional()
  assignmentNotes?: string;
} 