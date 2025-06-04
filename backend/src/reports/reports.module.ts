import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ReportsService } from "./reports.service"
import { ReportsController } from "./reports.controller"
import { Asset } from "../assets/entities/asset.entity"
import { AssetTransfer } from "../assets/entities/asset-transfer.entity"
import { AssetCheckout } from "../assets/entities/asset-checkout.entity"
import { MaintenanceRecord } from "../maintenance/entities/maintenance-record.entity"
import { InventoryItem } from "../inventory/entities/inventory-item.entity"
import { StockTransaction } from "../inventory/entities/stock-transaction.entity"
import { AuditLog } from "../audit/entities/audit-log.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetTransfer,
      AssetCheckout,
      MaintenanceRecord,
      InventoryItem,
      StockTransaction,
      AuditLog,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
