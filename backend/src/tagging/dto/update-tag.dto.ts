import { PartialType } from '@nestjs/swagger';
import { CreateTagDto } from './create-tag.dto';

export class UpdateTagDto extends PartialType(CreateTagDto) {}

// src/tagging/dto/assign-tag.dto.ts
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTagDto {
  @ApiProperty({ example: 'uuid-string', description: 'Resource ID to tag' })
  @IsUUID()
  resourceId: string;

  @ApiProperty({ example: 'document', description: 'Type of resource being tagged' })
  @IsString()
  resourceType: string;
}