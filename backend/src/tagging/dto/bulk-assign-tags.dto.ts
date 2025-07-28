import { IsArray, IsString, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkAssignTagsDto {
  @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'Array of resource IDs' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  resourceIds: string[];

  @ApiProperty({ example: 'document', description: 'Type of resources being tagged' })
  @IsString()
  resourceType: string;

  @ApiProperty({ example: ['uuid1', 'uuid2'], description: 'Array of tag IDs to assign' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  tagIds: string[];
}
