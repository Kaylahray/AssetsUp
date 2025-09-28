import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { InventoryAlertsService } from './inventory-alerts.service';
import { InventoryAlertsController } from './inventory-alerts.controller';
import { InventoryEventListener } from './listeners/inventory.listener';

@Module({
  // Import the InventoryItem repository so the service can use it
  imports: [TypeOrmModule.forFeature([InventoryItem])],
  controllers: [InventoryAlertsController],
  providers: [InventoryAlertsService, InventoryEventListener],
})
export class InventoryAlertsModule {}