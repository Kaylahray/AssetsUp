import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Length,
} from "class-validator";
import { DisposalMethod } from "../disposal-method.enum";

export class CreateDisposalRecordDto {
  @IsString()
  @Length(1, 100)
  assetId!: string;

  @IsEnum(DisposalMethod)
  disposalMethod!: DisposalMethod;

  @IsDateString()
  disposalDate!: string; // ISO date

  @IsNumber()
  @Min(0)
  finalValue!: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
