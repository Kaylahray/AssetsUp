import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ description: 'Asset serial number', example: 'SN123456789' })
  @IsString()
  serialNumber: string;

  @ApiProperty({ description: 'Purchase date (ISO format)', example: '2024-01-10T00:00:00.000Z' })
  @IsDateString()
  purchaseDate: string;

  @ApiPropertyOptional({ description: 'Warranty end date (ISO format)', example: '2025-01-10T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  warrantyEnd?: string;

  @ApiProperty({ description: 'Supplier ID', example: 1 })
  @IsNumber()
  supplierId: number;

  @ApiPropertyOptional({ description: 'Assigned department ID', example: 5 })
  @IsOptional()
  @IsNumber()
  assignedDepartmentId?: number;

  @ApiProperty({ description: 'Category ID', example: 3 })
  @IsNumber()
  categoryId: number;

  @ApiPropertyOptional({ description: 'Purchase cost', example: 1499.99 })
  @IsOptional()
  @IsNumber()
  purchaseCost?: number;

  @ApiPropertyOptional({ description: 'Asset description', example: 'Dell XPS 15 Laptop for engineering team' })
  @IsOptional()
  @IsString()
  description?: string;
}