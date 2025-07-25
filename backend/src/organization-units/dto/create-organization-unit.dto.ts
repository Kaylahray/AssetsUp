import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrganizationUnitType } from '../entities/organization-unit.entity';

export class CreateOrganizationUnitDto {
  @ApiProperty({ example: 'Lagos Branch' })
  @IsString()
  name: string;

  @ApiProperty({ enum: OrganizationUnitType })
  @IsEnum(OrganizationUnitType)
  type: OrganizationUnitType;

  @ApiProperty({ example: 'uuid-of-parent', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ example: 'Jane Doe', required: false })
  @IsString()
  @IsOptional()
  head?: string;
} 