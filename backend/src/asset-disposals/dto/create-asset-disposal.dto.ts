import { IsUUID, IsDateString, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisposalMethod } from '../entities/asset-disposal.entity';

export class CreateAssetDisposalDto {
  @ApiProperty({ description: 'UUID of the asset to dispose', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  assetId: string;

  @ApiProperty({ description: 'Disposal date (ISO format)', example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  disposalDate: string;

  @ApiProperty({ enum: DisposalMethod, description: 'Method of disposal' })
  @IsEnum(DisposalMethod)
  method: DisposalMethod;

  @ApiPropertyOptional({ description: 'Reason for disposal', example: 'Asset reached end of life' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ description: 'Person who approved the disposal', example: 'manager@company.com' })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}