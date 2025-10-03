import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InventoryAlertsService } from './inventory-alerts.service';

@ApiTags('Inventory Alerts')
@Controller('inventory-alerts')
export class InventoryAlertsController {
  constructor(private readonly alertsService: InventoryAlertsService) {}

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock alerts' })
  @ApiResponse({ status: 200, description: 'Low stock alerts retrieved successfully' })
  getLowStockAlerts() {
    return this.alertsService.getActiveAlerts();
  }
}