import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { BranchStatus } from "../entities/branch.entity";
import { Type } from "class-transformer";

export class FilterBranchDto {
  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number; // Search radius
}
