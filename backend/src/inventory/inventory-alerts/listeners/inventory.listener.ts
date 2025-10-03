import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InventoryAlertsService } from '../inventory-alerts.service';

// This payload should be emitted by your main InventoryService
// whenever an item's quantity changes.
export interface StockMovementPayload {
  itemId: string;
}

@Injectable()
export class InventoryEventListener {
  constructor(private readonly alertsService: InventoryAlertsService) {}

  @OnEvent('inventory.stock.changed')
  handleStockChangedEvent(payload: StockMovementPayload) {
    this.alertsService.checkThreshold(payload.itemId);
  }
}