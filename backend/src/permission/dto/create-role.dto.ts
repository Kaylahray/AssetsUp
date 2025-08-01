import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'Asset Manager',
    description: 'Name of the role',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Manages all asset-related operations',
    description: 'Description of the role',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is a default system role (cannot be deleted)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the role is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001'],
    description: 'Array of permission IDs to assign to the role',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  permissionIds?: string[];
}