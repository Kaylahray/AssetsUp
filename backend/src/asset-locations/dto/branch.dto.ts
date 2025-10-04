import { IsUUID, IsOptional, IsNumberString } from 'class-validator';

export class GetAssetsByBranchDto {
  // path param sometimes; we keep DTO for validation when using query
  @IsUUID()
  branchId!: string;

  @IsOptional()
  @IsNumberString()
  limit?: string; // parsed to number in controller

  @IsOptional()
  @IsNumberString()
  offset?: string;
}
