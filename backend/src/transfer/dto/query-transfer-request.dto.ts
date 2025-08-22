import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransferStatus } from '../enums/transfer-status.enum';

export class QueryTransferRequestDto {
  @IsOptional() @IsString()
  destination?: string; // maps to `toLocation`

  @IsOptional() @IsString()
  requester?: string; // maps to `requestedBy`

  @IsOptional() @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 20;
}