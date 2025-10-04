import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetLocation } from './asset-location.entity';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class AssetLocationsService {
  constructor(
    @InjectRepository(AssetLocation)
    private readonly repo: Repository<AssetLocation>,
  ) {}

  /**
   * Upsert the current location for an asset.
   * If the asset already has a row, update it; otherwise insert.
   */
  async upsertLocation(dto: UpdateLocationDto): Promise<AssetLocation> {
    const { assetId, branchId, latitude, longitude, locationNote } = dto;

    // Basic sanity: either branchId or both coordinates or at least something must be present
    if (!branchId && (latitude === undefined || longitude === undefined)) {
      throw new BadRequestException('Provide branchId or both latitude and longitude.');
    }

    // Try find existing
    let existing = await this.repo.findOne({ where: { assetId } });

    if (!existing) {
      existing = this.repo.create({
        assetId,
        branchId: branchId ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        locationNote: locationNote ?? null,
      });

      return this.repo.save(existing);
    }

    // update fields
    existing.branchId = branchId ?? existing.branchId ?? null;
    existing.latitude = latitude ?? existing.latitude ?? null;
    existing.longitude = longitude ?? existing.longitude ?? null;
    existing.locationNote = locationNote ?? existing.locationNote ?? null;

    return this.repo.save(existing);
  }

  /**
   * Get the latest location for a given asset
   */
  async getLocationByAsset(assetId: string): Promise<AssetLocation | null> {
    return this.repo.findOne({ where: { assetId } });
  }

  /**
   * Query assets currently assigned to a branch.
   * Returns AssetLocation[].
   */
  async getAssetsByBranch(branchId: string, limit = 100, offset = 0): Promise<AssetLocation[]> {
    return this.repo.find({
      where: { branchId },
      take: limit,
      skip: offset,
      order: { updatedAt: 'DESC' },
    });
  }

  /**
   * Query assets near a latitude/longitude within radius (meters).
   * Uses Haversine formula in SQL to calculate distance on the fly.
   *
   * Returns array of objects: { assetId, latitude, longitude, distance }
   */
  async getAssetsNearby(lat: number, lng: number, radiusMeters = 1000, limit = 100) {
    // Earth's radius in meters
    const earthRadius = 6371000;

    // We'll compute the Haversine distance using SQL formula. Filter out null coordinates.
    // Note: This works without PostGIS. Performance: if you need heavy usage consider PostGIS spatial index.

    const qb = this.repo.createQueryBuilder('al')
      .select([
        'al.assetId AS "assetId"',
        'al.latitude AS "latitude"',
        'al.longitude AS "longitude"',
        // Haversine distance:
        `(${earthRadius} * acos(
          cos(radians(:lat)) * cos(radians(al.latitude)) * cos(radians(al.longitude) - radians(:lng))
          + sin(radians(:lat)) * sin(radians(al.latitude))
        ))`
        + ' AS "distance"'
      ])
      .where('al.latitude IS NOT NULL')
      .andWhere('al.longitude IS NOT NULL')
      .setParameters({ lat, lng })
      .having(`(${earthRadius} * acos(
          cos(radians(:lat)) * cos(radians(al.latitude)) * cos(radians(al.longitude) - radians(:lng))
          + sin(radians(:lat)) * sin(radians(al.latitude))
        )) <= :radius`)
      .setParameter('radius', radiusMeters)
      .orderBy('"distance"', 'ASC')
      .limit(limit);

    // Note: some DB drivers require a groupBy if using having; however when selecting raw values and no aggregates,
    // PostgreSQL allows this pattern. If your DB errors, consider switching `having` to `andWhere` with the same expression.
    const raw = await qb.getRawMany();

    // raw rows have assetId, latitude, longitude, distance
    return raw.map((r) => ({
      assetId: r.assetId,
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      distance: parseFloat(r.distance),
    }));
  }
}
