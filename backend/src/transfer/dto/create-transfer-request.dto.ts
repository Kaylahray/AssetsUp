import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransferStatus } from '../enums/transfer-status.enum';

export class CreateTransferRequestDto {
  @IsString() @MaxLength(100)
  assetId: string;

  @IsString() @MaxLength(100)
  requestedBy: string;

  @IsString() @MaxLength(200)
  fromLocation: string;

  @IsString() @MaxLength(200)
  toLocation: string;

  @IsOptional() @IsString()
  reason?: string;

  // Optional: allow creating already-approved/started requests
  @IsOptional() @IsEnum(TransferStatus)
  status?: TransferStatus;
}