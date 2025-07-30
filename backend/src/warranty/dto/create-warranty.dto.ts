import { IsString, IsInt, IsDateString } from 'class-validator';

export class CreateWarrantyDto {
  @IsString()
  assetName: string;

  @IsInt()
  warrantyDurationInDays: number;

  @IsDateString()
  expiryDate: string;

  @IsString()
  terms: string;
}
