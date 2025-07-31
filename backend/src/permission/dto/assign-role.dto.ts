import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID of the user to assign the role to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'ID of the role to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'Optional expiration date for the role assignment',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class BulkAssignRoleDto {
  @ApiProperty({
    description: 'Array of user IDs to assign the role to',
    example: ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001'],
    type: [String],
  })
  @IsUUID(4, { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'ID of the role to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    description: 'Optional expiration date for the role assignments',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateRoleAssignmentDto {
  @ApiProperty({
    description: 'Whether the role assignment is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'New expiration date for the role assignment',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
