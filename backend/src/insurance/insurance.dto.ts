import { IsString, IsNotEmpty, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateAssetInsuranceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assetId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  policyNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  provider: string;

  @IsDateString()
  expiryDate: string; // ISO date string

  @IsOptional()
  @IsString()
  notes?: string;
}
