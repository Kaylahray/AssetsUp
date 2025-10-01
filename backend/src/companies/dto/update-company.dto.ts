import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ description: 'Company name', example: 'Acme Corporation Ltd', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Country of operation', example: 'United Kingdom', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'Business registration number', example: '987654321', maxLength: 150 })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  registrationNumber?: string;
}