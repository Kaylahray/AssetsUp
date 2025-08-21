import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { DisposalType } from '../entities/disposal.entity';

export class CreateDisposalDto {
  @IsEnum(DisposalType)
  @IsNotEmpty()
  disposalType: DisposalType;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsObject()
  @IsNotEmpty()
  assetData: Record<string, any>;

  @IsUUID()
  @IsNotEmpty()
  responsibleUserId: string;

  @IsDate()
  @IsNotEmpty()
  disposalDate: Date;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsNumber()
  @IsOptional()
  disposalValue?: number;
}

export class UpdateDisposalDto {
  @IsEnum(DisposalType)
  @IsOptional()
  disposalType?: DisposalType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsNumber()
  @IsOptional()
  disposalValue?: number;

  @IsBoolean()
  @IsOptional()
  isProcessed?: boolean;
}

export class DisposalFilterDto {
  @IsEnum(DisposalType)
  @IsOptional()
  disposalType?: DisposalType;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsUUID()
  @IsOptional()
  responsibleUserId?: string;

  @IsBoolean()
  @IsOptional()
  isProcessed?: boolean;
}
