import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ description: 'Branch name', example: 'New York Office', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Branch address', example: '123 Main St, New York, NY 10001', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiProperty({ description: 'Company ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  companyId: number;
}