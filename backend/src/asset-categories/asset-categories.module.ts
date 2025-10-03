import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetCategoriesService } from './asset-categories.service';
import { AssetCategoriesController } from './asset-categories.controller';
import { AssetCategory } from './asset-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetCategory])],
  controllers: [AssetCategoriesController],
  providers: [AssetCategoriesService],
  exports: [AssetCategoriesService],
})
export class AssetCategoriesModule {}
