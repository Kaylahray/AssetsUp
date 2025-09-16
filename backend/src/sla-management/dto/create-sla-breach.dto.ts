import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { SLABreachSeverity } from '../sla.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSLABreachDto {
  @ApiProperty({ description: 'SLA Record ID' })
  @IsNotEmpty()
  @IsString()
  slaRecordId: string;

  @ApiProperty({ description: 'Breach description' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ enum: SLABreachSeverity, description: 'Breach severity' })
  @IsEnum(SLABreachSeverity)
  severity: SLABreachSeverity;

  @ApiProperty({ description: 'Breach time' })
  @IsNotEmpty()
  @IsDateString()
  breachTime: string;

  @ApiProperty({ description: 'Resolution time', required: false })
  @IsOptional()
  @IsDateString()
  resolvedTime?: string;

  @ApiProperty({ description: 'Resolution notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNotes?: string;
}
