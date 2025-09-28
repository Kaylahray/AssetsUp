import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAssetCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
