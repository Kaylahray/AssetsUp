import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  MaxLength,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProcurementStatus } from '../entities/procurement-request.entity';
import { AssetStatus } from '../entities/asset-registration.entity';

export class CreateProcurementRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  itemName: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(9999)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  requestedBy: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApproveProcurementRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  decidedBy: string;

  @IsString()
  @IsOptional()
  notes?: string;

  // Asset registration data
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  serialNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  model?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  manufacturer?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  cost?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  assignedTo: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}

export class RejectProcurementRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  decidedBy: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateProcurementRequestDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  itemName?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Min(1)
  @Max(9999)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  quantity?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcurementRequestResponseDto {
  id: number;
  itemName: string;
  quantity: number;
  requestedBy: string;
  status: ProcurementStatus;
  notes: string | null;
  requestedAt: Date;
  decidedAt: Date | null;
  decidedBy: string | null;
  assetRegistrationId: number | null;

  constructor(procurementRequest: any) {
    this.id = procurementRequest.id;
    this.itemName = procurementRequest.itemName;
    this.quantity = procurementRequest.quantity;
    this.requestedBy = procurementRequest.requestedBy;
    this.status = procurementRequest.status;
    this.notes = procurementRequest.notes;
    this.requestedAt = procurementRequest.requestedAt;
    this.decidedAt = procurementRequest.decidedAt;
    this.decidedBy = procurementRequest.decidedBy;
    this.assetRegistrationId = procurementRequest.assetRegistrationId;
  }
}

export class AssetRegistrationResponseDto {
  id: number;
  assetId: string;
  assetName: string;
  description: string | null;
  serialNumber: string | null;
  model: string | null;
  manufacturer: string | null;
  cost: number | null;
  status: AssetStatus;
  assignedTo: string;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(assetRegistration: any) {
    this.id = assetRegistration.id;
    this.assetId = assetRegistration.assetId;
    this.assetName = assetRegistration.assetName;
    this.description = assetRegistration.description;
    this.serialNumber = assetRegistration.serialNumber;
    this.model = assetRegistration.model;
    this.manufacturer = assetRegistration.manufacturer;
    this.cost = assetRegistration.cost ? Number(assetRegistration.cost) : null;
    this.status = assetRegistration.status;
    this.assignedTo = assetRegistration.assignedTo;
    this.location = assetRegistration.location;
    this.createdAt = assetRegistration.createdAt;
    this.updatedAt = assetRegistration.updatedAt;
  }
}

export class ProcurementSummaryDto {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalAssetsCreated: number;

  constructor(data: Partial<ProcurementSummaryDto>) {
    Object.assign(this, data);
  }
}
