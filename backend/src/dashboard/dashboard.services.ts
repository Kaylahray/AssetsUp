import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

// --- ASSUMPTIONS ---
// We assume these entities exist in your project.
// You would import them from their actual locations.

// Example Asset Entity (e.g., src/assets/entities/asset.entity.ts)
enum AssetStatus {
  ACTIVE = 'active',
  DISPOSED = 'disposed',
  IN_REPAIR = 'in_repair',
}
class Asset {
  id: string;
  status: AssetStatus;
}

// Example InventoryItem Entity (e.g., src/inventory/entities/inventory-item.entity.ts)
class InventoryItem {
  id: string;
  quantity: number;
}
// --- END OF ASSUMPTIONS ---

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    // Run all aggregation queries concurrently for maximum performance
    const [totalAssets, disposedAssets, stockLevel] = await Promise.all([
      this.assetRepository.count(),
      this.assetRepository.count({ where: { status: AssetStatus.DISPOSED } }),
      this.inventoryRepository
        .createQueryBuilder('item')
        .select('SUM(item.quantity)', 'total')
        .getRawOne(),
    ]);

    return {
      totalAssets: totalAssets || 0,
      disposedAssets: disposedAssets || 0,
      totalStockItems: parseInt(stockLevel?.total, 10) || 0,
    };
  }
}