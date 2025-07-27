import { IsOptional, IsString } from 'class-validator';

export class UsageFilterDto {
  @IsOptional()
  @IsString()
  department?: string;
}
