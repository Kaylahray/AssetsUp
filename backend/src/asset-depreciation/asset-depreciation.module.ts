import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetDepreciationService } from './asset-depreciation.service';
import { AssetDepreciationController } from './asset-depreciation.controller';
import { AssetDepreciation } from './entities/asset-depreciation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetDepreciation])],
  controllers: [AssetDepreciationController],
  providers: [AssetDepreciationService],
  exports: [AssetDepreciationService],
})
export class AssetDepreciationModule {}
