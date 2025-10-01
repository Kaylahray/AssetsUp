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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProcurementStatus } from '../entities/procurement-request.entity';
import { AssetStatus } from '../entities/asset-registration.entity';

export class CreateProcurementRequestDto {
  @ApiProperty({ description: 'Name of the item to procure', example: 'Laptop Dell XPS 15', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  itemName: string;

  @ApiProperty({ description: 'Quantity to procure', example: 5, minimum: 1, maximum: 9999 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(9999)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @ApiProperty({ description: 'Name of the person requesting', example: 'john.doe@company.com', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  requestedBy: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Required for new team members' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApproveProcurementRequestDto {
  @ApiProperty({ description: 'Name of the approver', example: 'admin@company.com', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  decidedBy: string;

  @ApiPropertyOptional({ description: 'Approval notes', example: 'Approved for Q4 budget' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Asset description', example: 'Dell XPS 15 Laptop', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ description: 'Serial number', example: 'DXPS15789234', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  serialNumber?: string;

  @ApiPropertyOptional({ description: 'Model name', example: 'XPS 15 9530', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  model?: string;

  @ApiPropertyOptional({ description: 'Manufacturer', example: 'Dell Inc.', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Unit cost', example: 1499.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  cost?: number;

  @ApiProperty({ description: 'Person assigned to the asset', example: 'jane.smith@company.com', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  assignedTo: string;

  @ApiPropertyOptional({ description: 'Asset location', example: 'Floor 5, Desk 12', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;
}

export class RejectProcurementRequestDto {
  @ApiProperty({ description: 'Name of the rejector', example: 'admin@company.com', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  decidedBy: string;

  @ApiPropertyOptional({ description: 'Rejection reason', example: 'Exceeds budget allocation' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateProcurementRequestDto {
  @ApiPropertyOptional({ description: 'Name of the item to procure', example: 'Updated Laptop Model', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  itemName?: string;

  @ApiPropertyOptional({ description: 'Quantity to procure', example: 3, minimum: 1, maximum: 9999 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Min(1)
  @Max(9999)
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  quantity?: number;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Updated requirements' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ProcurementRequestResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Laptop Dell XPS 15' })
  itemName: string;

  @ApiProperty({ example: 5 })
  quantity: number;

  @ApiProperty({ example: 'john.doe@company.com' })
  requestedBy: string;

  @ApiProperty({ enum: ProcurementStatus })
  status: ProcurementStatus;

  @ApiPropertyOptional({ example: 'Required for new team members' })
  notes: string | null;

  @ApiProperty({ example: '2024-01-10T10:30:00.000Z' })
  requestedAt: Date;

  @ApiPropertyOptional({ example: '2024-01-11T14:20:00.000Z' })
  decidedAt: Date | null;

  @ApiPropertyOptional({ example: 'admin@company.com' })
  decidedBy: string | null;

  @ApiPropertyOptional({ example: 123 })
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
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'AST-2024-001' })
  assetId: string;

  @ApiProperty({ example: 'Dell XPS 15 Laptop' })
  assetName: string;

  @ApiPropertyOptional({ example: '15-inch laptop for development team' })
  description: string | null;

  @ApiPropertyOptional({ example: 'DXPS15789234' })
  serialNumber: string | null;

  @ApiPropertyOptional({ example: 'XPS 15 9530' })
  model: string | null;

  @ApiPropertyOptional({ example: 'Dell Inc.' })
  manufacturer: string | null;

  @ApiPropertyOptional({ example: 1499.99 })
  cost: number | null;

  @ApiProperty({ enum: AssetStatus })
  status: AssetStatus;

  @ApiProperty({ example: 'jane.smith@company.com' })
  assignedTo: string;

  @ApiPropertyOptional({ example: 'Floor 5, Desk 12' })
  location: string | null;

  @ApiProperty({ example: '2024-01-11T14:20:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-11T14:20:00.000Z' })
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
  @ApiProperty({ example: 50 })
  totalRequests: number;

  @ApiProperty({ example: 15 })
  pendingRequests: number;

  @ApiProperty({ example: 25 })
  approvedRequests: number;

  @ApiProperty({ example: 10 })
  rejectedRequests: number;

  @ApiProperty({ example: 25 })
  totalAssetsCreated: number;

  constructor(data: Partial<ProcurementSummaryDto>) {
    Object.assign(this, data);
  }
}