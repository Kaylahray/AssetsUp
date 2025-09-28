import { Controller, Get } from '@nestjs/common';
import { InventoryAlertsService } from './inventory-alerts.service';

@Controller('inventory-alerts')
export class InventoryAlertsController {
  constructor(private readonly alertsService: InventoryAlertsService) {}

  @Get('low-stock')
  getLowStockAlerts() {
    return this.alertsService.getActiveAlerts();
  }
}