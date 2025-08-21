import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum BarcodeType {
  QR = 'QR',
  CODE128 = 'CODE128',
}

export class CreateBarcodeDto {
  @ApiProperty({
    description: 'The unique reference ID of the asset/item',
    example: 'ASSET-123456',
  })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({
    description: 'The barcode type',
    enum: BarcodeType,
    example: BarcodeType.QR,
  })
  @IsEnum(BarcodeType)
  type: BarcodeType;

  @ApiPropertyOptional({
    description: 'Path to save barcode image (if applicable)',
    example: '/uploads/barcodes/ASSET-123456.png',
  })
  @IsOptional()
  @IsString()
  imagePath?: string;
}

export class RegenerateBarcodeDto {
  @ApiProperty({
    description: 'The reference ID whose barcode needs regeneration',
    example: 'ASSET-123456',
  })
  @IsString()
  @IsNotEmpty()
  referenceId: string;

  @ApiProperty({
    description: 'The new barcode type',
    enum: BarcodeType,
    example: BarcodeType.CODE128,
  })
  @IsEnum(BarcodeType)
  type: BarcodeType;
}