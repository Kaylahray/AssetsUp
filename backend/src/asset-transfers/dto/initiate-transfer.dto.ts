import { IsUUID, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class InitiateTransferDto {
  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @IsInt()
  @IsOptional()
  fromDepartmentId?: number;

  @IsInt()
  @IsNotEmpty()
  toDepartmentId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  initiatedBy: string;

  @IsString()
  @IsOptional()
  reason?: string;
}


