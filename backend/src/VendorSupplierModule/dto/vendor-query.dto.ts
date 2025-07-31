import { IsEnum, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { VendorType, VendorStatus } from "../vendor.enums";

export class VendorQueryDto {
  @IsOptional()
  @IsEnum(VendorType)
  type?: VendorType;

  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
