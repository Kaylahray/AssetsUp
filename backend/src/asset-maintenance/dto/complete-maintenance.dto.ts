import { IsDateString, IsString, IsOptional } from 'class-validator';

export class CompleteMaintenanceDto {
  @IsDateString()
  completedDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}