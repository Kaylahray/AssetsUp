import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem, InventoryStatus } from '../entities/inventory-item.entity';

export interface LowStockAlert {
  itemId: string;
  sku: string;
  name: string;
  currentQuantity: number;
  threshold: number;
  alertGeneratedAt: Date;
}

@Injectable()
export class InventoryAlertsService {
  private readonly logger = new Logger(InventoryAlertsService.name);
  // In a real app, this would be a database table to persist alerts.
  // For simplicity, we use an in-memory map. The key is the itemId.
  private activeAlerts = new Map<string, LowStockAlert>();

  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  /**
   * Checks an inventory item's stock level against its defined threshold.
   * If stock is low, it creates or updates an alert.
   * If stock is sufficient, it removes any existing alert.
   * @param itemId The ID of the inventory item to check.
   */
  async checkThreshold(itemId: string): Promise<void> {
    const item = await this.inventoryRepository.findOne({ where: { id: itemId } });

    if (!item) {
      this.logger.warn(`Attempted to check threshold for non-existent item ID: ${itemId}`);
      return;
    }

    // Ignore disposed items
    if (item.status === InventoryStatus.DISPOSED) {
      if (this.activeAlerts.has(item.id)) {
        this.activeAlerts.delete(item.id);
      }
      this.logger.log(`Skipping threshold check for disposed item ${item.name} (SKU: ${item.sku}).`);
      return;
    }

    if (item.quantity <= item.threshold) {
      // Stock is low or has reached the threshold, create/update an alert.
      if (!this.activeAlerts.has(item.id)) {
        const newAlert: LowStockAlert = {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          currentQuantity: item.quantity,
          threshold: item.threshold,
          alertGeneratedAt: new Date(),
        };
        this.activeAlerts.set(item.id, newAlert);
        this.logger.log(`New low-stock alert generated for ${item.name} (SKU: ${item.sku})`);
      }
    } else {
      // Stock is sufficient, remove any existing alert.
      if (this.activeAlerts.has(item.id)) {
        this.activeAlerts.delete(item.id);
        this.logger.log(`Low-stock alert for ${item.name} (SKU: ${item.sku}) has been resolved.`);
      }
    }
  }

  /**
   * Fetches all currently active low-stock alerts.
   */
  async getActiveAlerts(): Promise<LowStockAlert[]> {
    return Array.from(this.activeAlerts.values());
  }
}