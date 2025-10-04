import { IsUUID, IsOptional, IsNumber, IsString, IsLatitude, IsLongitude, Min, Max } from 'class-validator';

export class UpdateLocationDto {
  @IsUUID()
  assetId!: string;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  // Allow either branchId OR GPS coordinates (or both).
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;

  @IsOptional()
  @IsString()
  locationNote?: string;
}
