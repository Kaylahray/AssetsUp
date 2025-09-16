import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadAttachmentDto {
  @ApiPropertyOptional({
    description: 'Description of the attachment',
    example: 'Screenshot showing the error message',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the attachment is public',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Upload source',
    example: 'web',
    default: 'web',
  })
  @IsOptional()
  @IsString()
  uploadSource?: string;
}
