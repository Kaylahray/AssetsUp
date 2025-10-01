import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { AssetMaintenanceController } from './asset-maintenance.controller';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetMaintenance, InventoryItem])],
  controllers: [AssetMaintenanceController],
  providers: [AssetMaintenanceService],
  exports: [AssetMaintenanceService],
})
export class AssetMaintenanceModule {}