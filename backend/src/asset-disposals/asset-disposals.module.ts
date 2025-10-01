import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetDisposalsService } from './asset-disposals.service';
import { AssetDisposalsController } from './asset-disposals.controller';
import { AssetDisposal } from './entities/asset-disposal.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetDisposal, InventoryItem])],
  controllers: [AssetDisposalsController],
  providers: [AssetDisposalsService],
  exports: [AssetDisposalsService],
})
export class AssetDisposalsModule {}