import { IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateInsuranceDto {
  @IsOptional()
  @IsString()
  assetName?: string;

  @IsOptional()
  @IsString()
  insurer?: string;

  @IsOptional()
  @IsString()
  policyNumber?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  coverageType?: string;
} 