import { IsString, IsOptional, IsEnum } from 'class-validator';
import { IncidentResolutionStatus } from '../entities/incident.entity';

export class CreateIncidentDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  asset?: string;

  @IsOptional()
  @IsString()
  department?: string;
} 