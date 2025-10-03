import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier name', example: 'ABC Supplies Inc.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Contact information', example: 'John Doe - Sales Manager' })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @ApiPropertyOptional({ description: 'Physical address', example: '123 Business St, City, State 10001' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Email address', example: 'contact@abcsupplies.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-0123' })
  @IsString()
  phone: string;
}