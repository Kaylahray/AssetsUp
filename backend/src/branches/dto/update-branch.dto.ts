import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBranchDto {
  @ApiPropertyOptional({ description: 'Branch name', example: 'New York Headquarters', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Branch address', example: '456 Broadway, New York, NY 10002', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Company ID', example: 1 })
  @IsInt()
  @IsOptional()
  companyId?: number;
}