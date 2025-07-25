import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentDto } from './create-incident.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { IncidentResolutionStatus } from '../entities/incident.entity';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @IsOptional()
  @IsEnum(IncidentResolutionStatus)
  resolutionStatus?: IncidentResolutionStatus;
} 