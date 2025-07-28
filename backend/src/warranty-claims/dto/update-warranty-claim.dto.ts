import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { WarrantyClaimStatus } from '../enums/warranty-claim-status.enum';
import { CreateWarrantyClaimDto } from './create-warranty-claim.dto';

export class UpdateWarrantyClaimDto extends PartialType(CreateWarrantyClaimDto) {
  @IsOptional()
  @IsEnum(WarrantyClaimStatus)
  status?: WarrantyClaimStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  resolutionNotes?: string;
}