import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateUsageStatDto {
  @IsString()
  department: string;

  @IsNumber()
  usageHours: number;

  @IsString()
  assetType: string;

  @IsDateString()
  date: string;
}
