import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Asset } from 'src/assets/entity/asset.entity';
import { InventoryItem } from 'src/inventory/entities/inventory-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset, InventoryItem]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}