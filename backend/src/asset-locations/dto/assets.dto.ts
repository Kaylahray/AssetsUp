import { IsLatitude, IsLongitude, IsNumber, IsOptional, Min } from 'class-validator';

export class GetAssetsNearbyDto {
  @IsLatitude()
  lat!: number;

  @IsLongitude()
  lng!: number;

  /**
   * Radius in meters (default 1000m)
   */
  @IsOptional()
  @IsNumber()
  @Min(0)
  radius?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
