import { IsIn, IsOptional } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsIn(['csv', 'pdf'])
  format: 'csv' | 'pdf' = 'csv';
}
