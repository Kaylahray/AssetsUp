import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'create:puzzle', description: 'Unique permission identifier' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Allows a user to create a puzzle', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}