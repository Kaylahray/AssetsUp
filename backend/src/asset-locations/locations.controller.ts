import { Controller, Post, Body, Get, Param, Query, ParseUUIDPipe, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { AssetLocationsService } from './asset-locations.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { GetAssetsNearbyDto } from './dto/get-assets-nearby.dto';

@Controller('asset-locations')
export class AssetLocationsController {
  constructor(private readonly svc: AssetLocationsService) {}

  /**
   * Upsert current location for an asset.
   * POST /asset-locations
   */
  @Post()
  async upsertLocation(@Body() dto: UpdateLocationDto) {
    const updated = await this.svc.upsertLocation(dto);
    return { success: true, data: updated };
  }

  /**
   * Get current location for a given asset
   * GET /asset-locations/asset/:assetId
   */
  @Get('asset/:assetId')
  async getByAsset(@Param('assetId', ParseUUIDPipe) assetId: string) {
    const loc = await this.svc.getLocationByAsset(assetId);
    return { success: true, data: loc };
  }

  /**
   * Get assets assigned to a branch
   * GET /asset-locations/branch/:branchId?limit=50&offset=0
   */
  @Get('branch/:branchId')
  async getByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query('limit', new DefaultValuePipe('100'), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe('0'), ParseIntPipe) offset: number,
  ) {
    const rows = await this.svc.getAssetsByBranch(branchId, limit, offset);
    return { success: true, total: rows.length, data: rows };
  }

  /**
   * Query nearby assets
   * GET /asset-locations/nearby?lat=..&lng=..&radius=1000&limit=50
   */
  @Get('nearby')
  async getNearby(@Query() q: GetAssetsNearbyDto) {
    // class-validator won't run automatically for query objects without ValidationPipe configured globally,
    // but in typical Nest projects a global ValidationPipe is set. We'll assume that.
    const radius = q.radius ?? 1000;
    const limit = q.limit ?? 100;
    const rows = await this.svc.getAssetsNearby(q.lat, q.lng, radius, limit);
    return { success: true, total: rows.length, data: rows };
  }
}
