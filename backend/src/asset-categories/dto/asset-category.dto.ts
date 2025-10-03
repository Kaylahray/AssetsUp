import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetCategoryDto {
  @ApiProperty({ description: 'Asset category name', example: 'Electronics', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Category description', example: 'Electronic devices and equipment' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateAssetCategoryDto {
  @ApiPropertyOptional({ description: 'Asset category name', example: 'IT Equipment', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Category description', example: 'IT and computer equipment' })
  @IsString()
  @IsOptional()
  description?: string;
}