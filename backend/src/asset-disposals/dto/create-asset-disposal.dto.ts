import { IsUUID, IsDateString, IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { DisposalMethod } from '../entities/asset-disposal.entity';

export class CreateAssetDisposalDto {
  @IsUUID()
  assetId: string;

  @IsDateString()
  disposalDate: string;

  @IsEnum(DisposalMethod)
  method: DisposalMethod;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}