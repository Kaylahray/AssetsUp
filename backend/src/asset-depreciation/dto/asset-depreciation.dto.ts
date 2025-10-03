import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DepreciationMethod } from '../entities/asset-depreciation.entity';

export class CreateAssetDepreciationDto {
  @ApiProperty({ description: 'Name of the asset', example: 'Dell XPS 15 Laptop', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  assetName: string;

  @ApiPropertyOptional({ description: 'Asset description', example: 'Laptop for engineering team' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Purchase price of the asset', example: 1499.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  purchasePrice: number;

  @ApiProperty({ description: 'Purchase date (ISO format)', example: '2024-01-10T00:00:00.000Z' })
  @IsDateString()
  purchaseDate: string;

  @ApiProperty({ description: 'Useful life in years', example: 5, minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100) 
  @Transform(({ value }) => parseInt(value))
  usefulLifeYears: number;

  @ApiPropertyOptional({ enum: DepreciationMethod, description: 'Depreciation calculation method' })
  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @ApiPropertyOptional({ description: 'Estimated salvage value', example: 100.00, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  salvageValue?: number;
}

export class UpdateAssetDepreciationDto {
  @ApiPropertyOptional({ description: 'Name of the asset', example: 'Dell XPS 15 Laptop Pro', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  assetName?: string;

  @ApiPropertyOptional({ description: 'Asset description', example: 'Laptop for senior engineering team' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Purchase price of the asset', example: 1599.99, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  purchasePrice?: number;

  @ApiPropertyOptional({ description: 'Purchase date (ISO format)', example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Useful life in years', example: 4, minimum: 1, maximum: 100 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  usefulLifeYears?: number;

  @ApiPropertyOptional({ enum: DepreciationMethod, description: 'Depreciation calculation method' })
  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @ApiPropertyOptional({ description: 'Estimated salvage value', example: 150.00, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  salvageValue?: number;
}

export class DepreciatedValueResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Dell XPS 15 Laptop' })
  assetName: string;

  @ApiPropertyOptional({ example: 'Laptop for engineering team' })
  description?: string;

  @ApiProperty({ example: 1499.99 })
  purchasePrice: number;

  @ApiProperty({ example: '2024-01-10T00:00:00.000Z' })
  purchaseDate: string;

  @ApiProperty({ example: 5 })
  usefulLifeYears: number;

  @ApiProperty({ enum: DepreciationMethod })
  depreciationMethod: DepreciationMethod;

  @ApiPropertyOptional({ example: 100.00 })
  salvageValue?: number;

  @ApiProperty({ example: 1199.99 })
  currentDepreciatedValue: number;

  @ApiProperty({ example: 299.99 })
  annualDepreciation: number;

  @ApiProperty({ example: 300.00 })
  totalDepreciationToDate: number;

  @ApiProperty({ example: 4.5 })
  remainingUsefulLife: number;

  @ApiProperty({ example: false })
  isFullyDepreciated: boolean;

  @ApiProperty({ example: '2024-01-10T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-10T10:30:00.000Z' })
  updatedAt: Date;

  constructor(assetDepreciation: any) {
    this.id = assetDepreciation.id;
    this.assetName = assetDepreciation.assetName;
    this.description = assetDepreciation.description;
    this.purchasePrice = Number(assetDepreciation.purchasePrice);
    this.purchaseDate = assetDepreciation.purchaseDate;
    this.usefulLifeYears = assetDepreciation.usefulLifeYears;
    this.depreciationMethod = assetDepreciation.depreciationMethod;
    this.salvageValue = assetDepreciation.salvageValue ? Number(assetDepreciation.salvageValue) : undefined;
    this.currentDepreciatedValue = Number(assetDepreciation.getCurrentDepreciatedValue().toFixed(2));
    this.annualDepreciation = Number(assetDepreciation.getAnnualDepreciation().toFixed(2));
    this.totalDepreciationToDate = Number(assetDepreciation.getTotalDepreciationToDate().toFixed(2));
    this.remainingUsefulLife = Number(assetDepreciation.getRemainingUsefulLife().toFixed(2));
    this.isFullyDepreciated = assetDepreciation.isFullyDepreciated();
    this.createdAt = assetDepreciation.createdAt;
    this.updatedAt = assetDepreciation.updatedAt;
  }
}

export class AssetDepreciationSummaryDto {
  @ApiProperty({ example: 50 })
  totalAssets: number;

  @ApiProperty({ example: 75000.00 })
  totalPurchaseValue: number;

  @ApiProperty({ example: 45000.00 })
  totalCurrentValue: number;

  @ApiProperty({ example: 30000.00 })
  totalDepreciation: number;

  @ApiProperty({ example: 10 })
  fullyDepreciatedAssets: number;

  @ApiProperty({ example: 2.5 })
  averageAge: number;

  constructor(data: Partial<AssetDepreciationSummaryDto>) {
    Object.assign(this, data);
  }
}