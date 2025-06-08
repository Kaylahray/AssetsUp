import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from "@nestjs/common"
import type { TaskService } from "../services/task.service"
import type { AssetTaskService } from "../services/asset-task.service"
import type { MaintenanceTaskService } from "../services/maintenance-task.service"
import type { InventoryTaskService } from "../services/inventory-task.service"
import type { CreateScheduledTaskDto } from "../dto/create-scheduled-task.dto"
import type { UpdateScheduledTaskDto } from "../dto/update-scheduled-task.dto"

@Controller("scheduled-tasks")
export class ScheduledTasksController {
  constructor(
    private readonly taskService: TaskService,
    private readonly assetTaskService: AssetTaskService,
    private readonly maintenanceTaskService: MaintenanceTaskService,
    private readonly inventoryTaskService: InventoryTaskService,
  ) {}

  @Post()
  create(createScheduledTaskDto: CreateScheduledTaskDto) {
    return this.taskService.create(createScheduledTaskDto)
  }

  @Get()
  findAll() {
    return this.taskService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateScheduledTaskDto: UpdateScheduledTaskDto) {
    return this.taskService.update(id, updateScheduledTaskDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.taskService.remove(id);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string) {
    return this.taskService.toggleStatus(id);
  }

  @Get(':id/executions')
  getTaskExecutions(@Param('id') id: string) {
    return this.taskService.getTaskExecutions(id);
  }

  // Asset-related endpoints
  @Get("assets/overdue")
  getOverdueAssets() {
    return this.assetTaskService.getOverdueAssets()
  }

  @Post('assets/detect-overdue')
  detectOverdueAssets(@Body() configuration?: any) {
    return this.assetTaskService.detectOverdueAssets(configuration);
  }

  // Maintenance-related endpoints
  @Get('maintenance/upcoming')
  getUpcomingMaintenance(@Query('days') days?: number) {
    return this.maintenanceTaskService.getUpcomingMaintenance(days ? Number.parseInt(days) : 30);
  }

  @Get("maintenance/overdue")
  getOverdueMaintenance() {
    return this.maintenanceTaskService.getOverdueMaintenance()
  }

  @Post('maintenance/send-reminders')
  sendMaintenanceReminders(@Body() configuration?: any) {
    return this.maintenanceTaskService.sendMaintenanceReminders(configuration);
  }

  @Patch('maintenance/:id/complete')
  completeMaintenance(@Param('id') id: string) {
    return this.maintenanceTaskService.completeMaintenance(id);
  }

  // Inventory-related endpoints
  @Get("inventory/low-stock")
  getLowStockItems() {
    return this.inventoryTaskService.getLowStockItems()
  }

  @Get("inventory/critical-stock")
  getCriticalStockItems() {
    return this.inventoryTaskService.getCriticalStockItems()
  }

  @Post('inventory/detect-low-stock')
  detectLowStock(@Body() configuration?: any) {
    return this.inventoryTaskService.detectLowStock(configuration);
  }

  @Get("inventory/restock-report")
  generateRestockReport() {
    return this.inventoryTaskService.generateRestockReport()
  }

  @Patch("inventory/:id/update-stock")
  updateStock(@Param('id') id: string, @Body('stock') stock: number) {
    return this.inventoryTaskService.updateStock(id, stock)
  }
}
