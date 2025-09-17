import { IsOptional, IsEnum, IsString, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { SLAStatus, SLAPriority, AssetCategory } from '../sla.enums';
import { ApiProperty } from '@nestjs/swagger';

export class SLAQueryDto {
  @ApiProperty({ description: 'Vendor ID filter', required: false })
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiProperty({ enum: AssetCategory, description: 'Asset category filter', required: false })
  @IsOptional()
  @IsEnum(AssetCategory)
  assetCategory?: AssetCategory;

  @ApiProperty({ enum: SLAStatus, description: 'Status filter', required: false })
  @IsOptional()
  @IsEnum(SLAStatus)
  status?: SLAStatus;

  @ApiProperty({ enum: SLAPriority, description: 'Priority filter', required: false })
  @IsOptional()
  @IsEnum(SLAPriority)
  priority?: SLAPriority;

  @ApiProperty({ description: 'Filter by expiration date', required: false })
  @IsOptional()
  @IsDateString()
  expiringBefore?: string;

  @ApiProperty({ description: 'Filter by coverage start date', required: false })
  @IsOptional()
  @IsDateString()
  coverageStartAfter?: string;

  @ApiProperty({ description: 'Filter by coverage end date', required: false })
  @IsOptional()
  @IsDateString()
  coverageEndBefore?: string;

  @ApiProperty({ description: 'Show only expired SLAs', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  expired?: boolean;

  @ApiProperty({ description: 'Show only expiring soon SLAs', required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  expiringSoon?: boolean;

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
