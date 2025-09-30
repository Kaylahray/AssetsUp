import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetSubcategory } from './entities/asset-subcategory.entity';
import { AssetSubcategoriesService } from './asset-subcategories.service';
import { AssetSubcategoriesController } from './asset-subcategories.controller';

@Module({
	imports: [TypeOrmModule.forFeature([AssetSubcategory])],
	providers: [AssetSubcategoriesService],
	controllers: [AssetSubcategoriesController],
})
export class AssetSubcategoriesModule {}
