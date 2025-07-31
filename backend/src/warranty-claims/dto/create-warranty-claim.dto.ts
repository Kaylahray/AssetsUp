import { IsNotEmpty, IsString, IsUUID, IsOptional, IsArray, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarrantyClaimDto {
  @ApiProperty({ description: 'Asset ID for the warranty claim' })
  @IsNotEmpty()
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: 'Warranty ID for the claim' })
  @IsNotEmpty()
  @IsUUID()
  warrantyId: string;

  @ApiProperty({ description: 'Description of the warranty claim issue' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({ description: 'Vendor ID associated with the warranty' })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({ description: 'Supporting document file paths' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingDocs?: string[];
}