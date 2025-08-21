import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TransferStatus } from '../enums/transfer-status.enum';

export class UpdateTransferRequestDto {
  @IsOptional() @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsOptional() @IsString()
  toLocation?: string;

  @IsOptional() @IsString()
  fromLocation?: string;

  @IsOptional() @IsString()
  reason?: string;
}