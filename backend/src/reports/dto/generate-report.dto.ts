import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateReportDto {
  @ApiPropertyOptional({ description: 'Start date for report period (ISO format)', example: '2024-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for report period (ISO format)', example: '2024-01-31T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by asset category', example: 'electronics' })
  @IsString()
  @IsOptional()
  category?: string;
  
  @ApiPropertyOptional({ description: 'Filter by department', example: 'finance' })
  @IsString()
  @IsOptional()
  department?: string;
}