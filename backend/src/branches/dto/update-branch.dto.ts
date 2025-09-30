import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsInt()
  @IsOptional()
  companyId?: number;
}


