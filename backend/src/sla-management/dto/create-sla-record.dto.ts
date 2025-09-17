import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { SLAPriority, AssetCategory } from '../sla.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSLARecordDto {
  @ApiProperty({ description: 'Vendor ID' })
  @IsNotEmpty()
  @IsString()
  vendorId: string;

  @ApiProperty({ description: 'Service description' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  serviceDescription: string;

  @ApiProperty({ description: 'Coverage start date' })
  @IsNotEmpty()
  @IsDateString()
  coverageStart: string;

  @ApiProperty({ description: 'Coverage end date' })
  @IsNotEmpty()
  @IsDateString()
  coverageEnd: string;

  @ApiProperty({ enum: AssetCategory, description: 'Asset category' })
  @IsEnum(AssetCategory)
  assetCategory: AssetCategory;

  @ApiProperty({ description: 'Breach policy details' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  breachPolicy: string;

  @ApiProperty({ enum: SLAPriority, description: 'SLA priority', required: false })
  @IsOptional()
  @IsEnum(SLAPriority)
  priority?: SLAPriority;

  @ApiProperty({ description: 'Response time in hours', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  responseTimeHours?: number;

  @ApiProperty({ description: 'Resolution time in hours', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  resolutionTimeHours?: number;

  @ApiProperty({ description: 'Uptime percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  uptimePercentage?: number;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
