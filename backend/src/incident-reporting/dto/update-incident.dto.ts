import { IsArray, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IncidentReportType } from '../incident-report.entity';

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentReportType)
  @IsOptional()
  reportType?: IncidentReportType;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}


