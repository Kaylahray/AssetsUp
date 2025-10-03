import { IsString, IsNotEmpty, IsOptional, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Engineering', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @ApiPropertyOptional({ description: 'Department description', example: 'Software development team' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'Department name', example: 'Software Engineering', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Company ID', example: 1 })
  @IsInt()
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Department description', example: 'Software development and engineering team' })
  @IsString()
  @IsOptional()
  description?: string;
}