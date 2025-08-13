import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AssetStatus } from '../entities/status-history.entity';

export class CreateStatusHistoryDto {
  @ApiProperty({ description: 'Asset ID (mock ref)' })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  previousStatus: AssetStatus;

  @ApiProperty({ enum: AssetStatus })
  @IsEnum(AssetStatus)
  newStatus: AssetStatus;

  @ApiProperty({ description: 'User identifier who made the change' })
  @IsString()
  @IsNotEmpty()
  changedBy: string;
}
