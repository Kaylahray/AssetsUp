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
import { DepreciationMethod } from '../entities/asset-depreciation.entity';

export class CreateAssetDepreciationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  assetName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  purchasePrice: number;

  @IsDateString()
  purchaseDate: string;

  @IsNumber()
  @Min(1)
  @Max(100) 
  @Transform(({ value }) => parseInt(value))
  usefulLifeYears: number;

  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  salvageValue?: number;
}

export class UpdateAssetDepreciationDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  assetName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  purchasePrice?: number;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  usefulLifeYears?: number;

  @IsEnum(DepreciationMethod)
  @IsOptional()
  depreciationMethod?: DepreciationMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  salvageValue?: number;
}

export class DepreciatedValueResponseDto {
  id: number;
  assetName: string;
  description?: string;
  purchasePrice: number;
  purchaseDate: string;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  salvageValue?: number;
  currentDepreciatedValue: number;
  annualDepreciation: number;
  totalDepreciationToDate: number;
  remainingUsefulLife: number;
  isFullyDepreciated: boolean;
  createdAt: Date;
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
  totalAssets: number;
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalDepreciation: number;
  fullyDepreciatedAssets: number;
  averageAge: number;

  constructor(data: Partial<AssetDepreciationSummaryDto>) {
    Object.assign(this, data);
  }
}
