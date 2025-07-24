import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Role name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: ['uuid-1', 'uuid-2'],
    description: 'List of permission IDs to assign to the role',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}