import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
