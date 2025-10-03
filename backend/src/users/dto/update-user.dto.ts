import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name of the user', example: 'John Doe' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Password (min 6 characters)', example: 'newpassword123' })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ 
    description: 'User role', 
    enum: ['admin', 'user', 'manager'],
    example: 'manager'
  })
  @IsOptional()
  @IsString()
  @IsEnum(['admin', 'user', 'manager'])
  role?: 'admin' | 'user' | 'manager';

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