import { IsDateString, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteMaintenanceDto {
  @ApiProperty({ description: 'Maintenance completion date (ISO format)', example: '2024-01-15T10:30:00.000Z' })
  @IsDateString()
  completedDate: string;

  @ApiPropertyOptional({ description: 'Maintenance notes', example: 'Replaced faulty components and performed calibration' })
  @IsString()
  @IsOptional()
  notes?: string;
}