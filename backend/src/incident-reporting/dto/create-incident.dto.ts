import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IncidentReportType } from '../incident-report.entity';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(IncidentReportType)
  reportType: IncidentReportType;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsNotEmpty()
  submittedBy: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}


