import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Insurance policy ID' })
  @IsNotEmpty()
  @IsString()
  insurancePolicyId: string;

  @ApiProperty({ description: 'Document type (policy, certificate, amendment, etc.)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentType?: string;

  @ApiProperty({ description: 'Document description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Uploaded by user ID', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  uploadedBy?: string;
}
