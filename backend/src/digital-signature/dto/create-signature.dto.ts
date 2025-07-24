import { IsNotEmpty, IsString, IsBase64 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSignatureDto {
  @ApiProperty({ example: 'user_123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'doc_456' })
  @IsString()
  @IsNotEmpty()
  documentId: string;

  @ApiProperty({
    description: 'Base64-encoded signature image',
    type: String,
  })
  @IsString()
  @IsBase64()
  signatureImage: string;
}