import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetLocation } from './asset-location.entity';
import { AssetLocationsService } from './asset-locations.service';
import { AssetLocationsController } from './asset-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssetLocation])],
  providers: [AssetLocationsService],
  controllers: [AssetLocationsController],
  exports: [AssetLocationsService],
})
export class AssetLocationsModule {}
