import { IsString, IsDateString } from 'class-validator';

export class CreateInsuranceDto {
  @IsString()
  assetName: string;

  @IsString()
  insurer: string;

  @IsString()
  policyNumber: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  coverageType: string;
} 