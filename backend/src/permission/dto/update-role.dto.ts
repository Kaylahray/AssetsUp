import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Senior Asset Manager',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Description of the role',
    example: 'Senior level asset management with additional privileges',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Whether the role is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Array of permission IDs to assign to the role',
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  permissionIds?: string[];
}
