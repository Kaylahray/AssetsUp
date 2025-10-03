import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

// --- ASSUMPTIONS ---
// You would import your actual entities here
class Asset {}
class InventoryItem {}
// --- END OF ASSUMPTIONS ---

@Module({
  imports: [
    // Make the Asset and InventoryItem repositories available to this module
    TypeOrmModule.forFeature([Asset, InventoryItem]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}