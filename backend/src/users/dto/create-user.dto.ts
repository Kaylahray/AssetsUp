import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'Password (min 6 characters)', example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ 
    description: 'User role', 
    enum: ['admin', 'user', 'manager'],
    example: 'user'
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @IsEnum(['admin', 'user', 'manager'])
  role: 'admin' | 'user' | 'manager';

  @ApiPropertyOptional({ description: 'Company ID', example: 1 })
  @IsOptional()
  companyId?: number;

  @ApiPropertyOptional({ description: 'Department ID', example: 5 })
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({ description: 'Branch ID', example: 3 })
  @IsOptional()
  branchId?: number;
}