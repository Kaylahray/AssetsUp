import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryService } from "./inventory.service"
import { InventoryController } from "./inventory.controller"
import { StockTransactionsService } from "./stock-transactions.service"
import { StockTransactionsController } from "./stock-transactions.controller"
import { InventoryItem } from "./entities/inventory-item.entity"
import { StockTransaction } from "./entities/stock-transaction.entity"
import { NotificationsModule } from "../notifications/notifications.module"
import { StarknetModule } from "../starknet/starknet.module"

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, StockTransaction]), NotificationsModule, StarknetModule],
  controllers: [InventoryController, StockTransactionsController],
  providers: [InventoryService, StockTransactionsService],
  exports: [InventoryService, StockTransactionsService],
})
export class InventoryModule {}
