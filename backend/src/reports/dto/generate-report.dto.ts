import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GenerateReportDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  category?: string;
  
  @IsString()
  @IsOptional()
  department?: string;
}