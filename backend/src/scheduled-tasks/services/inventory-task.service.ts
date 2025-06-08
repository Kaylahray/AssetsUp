import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { InventoryItem } from "../entities/inventory-item.entity"
import type { NotificationService } from "./notification.service"

@Injectable()
export class InventoryTaskService {
  private readonly logger = new Logger(InventoryTaskService.name);

  constructor(
    private readonly inventoryRepository: Repository<InventoryItem>,
    private readonly notificationService: NotificationService,
    @InjectRepository(InventoryItem)
  ) {}

  async detectLowStock(configuration: any = {}): Promise<any> {
    const { checkCritical = true, checkMinimum = true, notifyUsers = [], categories = [] } = configuration

    const results = {
      criticalItems: [],
      lowStockItems: [],
      totalAffectedItems: 0,
    }

    // Find critical stock items
    if (checkCritical) {
      const criticalItems = await this.inventoryRepository
        .createQueryBuilder("item")
        .where("item.currentStock <= item.criticalThreshold")
        .andWhere("item.isActive = :isActive", { isActive: true })
        .andWhere(categories.length > 0 ? "item.category IN (:...categories)" : "1=1", { categories })
        .getMany()

      results.criticalItems = criticalItems.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        currentStock: item.currentStock,
        criticalThreshold: item.criticalThreshold,
        category: item.category,
        supplier: item.supplier,
      }))

      this.logger.warn(`Found ${criticalItems.length} items with critical stock levels`)
    }

    // Find low stock items (above critical but below minimum)
    if (checkMinimum) {
      const lowStockItems = await this.inventoryRepository
        .createQueryBuilder("item")
        .where("item.currentStock > item.criticalThreshold")
        .andWhere("item.currentStock <= item.minimumThreshold")
        .andWhere("item.isActive = :isActive", { isActive: true })
        .andWhere(categories.length > 0 ? "item.category IN (:...categories)" : "1=1", { categories })
        .getMany()

      results.lowStockItems = lowStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        currentStock: item.currentStock,
        minimumThreshold: item.minimumThreshold,
        category: item.category,
        supplier: item.supplier,
      }))

      this.logger.log(`Found ${lowStockItems.length} items with low stock levels`)
    }

    results.totalAffectedItems = results.criticalItems.length + results.lowStockItems.length

    // Send notifications if there are items to report
    if (results.totalAffectedItems > 0) {
      for (const user of notifyUsers) {
        await this.notificationService.sendLowStockNotification(user, results)
      }
    }

    return results
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .where("item.currentStock <= item.minimumThreshold")
      .andWhere("item.isActive = :isActive", { isActive: true })
      .orderBy("item.currentStock", "ASC")
      .getMany()
  }

  async getCriticalStockItems(): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .where("item.currentStock <= item.criticalThreshold")
      .andWhere("item.isActive = :isActive", { isActive: true })
      .orderBy("item.currentStock", "ASC")
      .getMany()
  }

  async updateStock(itemId: string, newStock: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({ where: { id: itemId } })

    if (item) {
      const previousStock = item.currentStock
      item.currentStock = newStock

      if (newStock > previousStock) {
        item.lastRestockedDate = new Date()
      }

      return this.inventoryRepository.save(item)
    }

    return null
  }

  async generateRestockReport(): Promise<any> {
    const lowStockItems = await this.getLowStockItems()
    const criticalItems = await this.getCriticalStockItems()

    return {
      summary: {
        totalLowStock: lowStockItems.length,
        totalCritical: criticalItems.length,
        generatedAt: new Date(),
      },
      criticalItems: criticalItems.map((item) => ({
        ...item,
        recommendedOrderQuantity: Math.max(
          item.minimumThreshold - item.currentStock,
          item.maximumStock ? item.maximumStock - item.currentStock : item.minimumThreshold,
        ),
      })),
      lowStockItems: lowStockItems.map((item) => ({
        ...item,
        recommendedOrderQuantity: Math.max(
          item.minimumThreshold - item.currentStock,
          item.maximumStock ? item.maximumStock - item.currentStock : item.minimumThreshold,
        ),
      })),
    }
  }
}
