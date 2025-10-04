import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetInsuranceDto } from './create-asset-insurance.dto';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateAssetInsuranceDto extends PartialType(CreateAssetInsuranceDto) {
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
