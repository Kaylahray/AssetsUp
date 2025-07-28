import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTagsDto {
  @ApiPropertyOptional({ example: 'uuid-string', description: 'Filter by resource ID' })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiPropertyOptional({ example: 'document', description: 'Filter by resource type' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ example: 'important', description: 'Search tags by name' })
  @IsOptional()
  @IsString()
  search?: string;
}
