import { IsOptional, IsEnum, IsString, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { InsurancePolicyStatus, InsuranceType, CoverageLevel, RenewalStatus } from '../insurance.enums';
import { ApiProperty } from '@nestjs/swagger';

export class InsuranceQueryDto {
  @ApiProperty({ description: 'Asset ID filter', required: false })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiProperty({ description: 'Asset category filter', required: false })
  @IsOptional()
  @IsString()
  assetCategory?: string;

  @ApiProperty({ description: 'Insurance provider filter', required: false })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({ enum: InsurancePolicyStatus, description: 'Policy status filter', required: false })
  @IsOptional()
  @IsEnum(InsurancePolicyStatus)
  status?: InsurancePolicyStatus;

  @ApiProperty({ enum: InsuranceType, description: 'Insurance type filter', required: false })
  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: InsuranceType;

  @ApiProperty({ enum: CoverageLevel, description: 'Coverage level filter', required: false })
  @IsOptional()
  @IsEnum(CoverageLevel)
  coverageLevel?: CoverageLevel;

  @ApiProperty({ enum: RenewalStatus, description: 'Renewal status filter', required: false })
  @IsOptional()
  @IsEnum(RenewalStatus)
  renewalStatus?: RenewalStatus;

  @ApiProperty({ description: 'Filter by coverage end date (before this date)', required: false })
  @IsOptional()
  @IsDateString()
  coverageEndBefore?: string;

  @ApiProperty({ description: 'Filter by coverage start date (after this date)', required: false })
  @IsOptional()
  @IsDateString()
  coverageStartAfter?: string;

  @ApiProperty({ description: 'Minimum insured value', required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  minInsuredValue?: number;

  @ApiProperty({ description: 'Maximum insured value', required: false })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  maxInsuredValue?: number;

  @ApiProperty({ description: 'Show only expired policies', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  expired?: boolean;

  @ApiProperty({ description: 'Show only policies expiring soon', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  expiringSoon?: boolean;

  @ApiProperty({ description: 'Show only policies due for renewal', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  dueForRenewal?: boolean;

  @ApiProperty({ description: 'Search in policy numbers, provider names, or notes', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number = 10;

  @ApiProperty({ description: 'Sort by field', required: false, default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', required: false, default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
