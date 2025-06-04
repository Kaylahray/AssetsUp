import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common"
import type { MaintenanceService } from "./maintenance.service"
import type { CreateMaintenanceDto } from "./dto/create-maintenance.dto"
import type { UpdateMaintenanceDto } from "./dto/update-maintenance.dto"
import type { MaintenanceFilterDto } from "./dto/maintenance-filter.dto"

@Controller("maintenance")
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  findAll(@Query() filters: MaintenanceFilterDto) {
    return this.maintenanceService.findAll(filters);
  }

  @Get('upcoming')
  getUpcoming(@Query('days') days?: string) {
    const daysAhead = days ? Number.parseInt(days, 10) : 7;
    return this.maintenanceService.getUpcomingMaintenance(daysAhead);
  }

  @Get("overdue")
  getOverdue() {
    return this.maintenanceService.getOverdueMaintenance()
  }

  @Get('stats')
  getStats(@Query('assetId') assetId?: string) {
    return this.maintenanceService.getMaintenanceStats(assetId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, updateMaintenanceDto)
  }

  @Patch(":id/complete")
  @HttpCode(HttpStatus.OK)
  markAsCompleted(@Param('id', ParseUUIDPipe) id: string, @Body('actualHours') actualHours?: number) {
    return this.maintenanceService.markAsCompleted(id, actualHours)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.remove(id);
  }
}

@Controller("assets")
export class AssetMaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get(':id/maintenance-history')
  getMaintenanceHistory(@Param('id', ParseUUIDPipe) assetId: string) {
    return this.maintenanceService.getAssetMaintenanceHistory(assetId);
  }
}
