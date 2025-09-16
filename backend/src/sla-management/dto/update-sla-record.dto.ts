import { PartialType } from '@nestjs/mapped-types';
import { CreateSLARecordDto } from './create-sla-record.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { SLAStatus } from '../sla.enums';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSLARecordDto extends PartialType(CreateSLARecordDto) {
  @ApiProperty({ enum: SLAStatus, description: 'SLA status', required: false })
  @IsOptional()
  @IsEnum(SLAStatus)
  status?: SLAStatus;
}
