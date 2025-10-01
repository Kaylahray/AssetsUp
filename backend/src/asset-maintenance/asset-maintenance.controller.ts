import { Controller, Post, Body, Get, Param, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { ScheduleMaintenanceDto } from './dto/schedule-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';

@Controller('asset-maintenance')
export class AssetMaintenanceController {
  constructor(private readonly maintenanceService: AssetMaintenanceService) {}

  @Post('schedule')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  schedule(@Body() dto: ScheduleMaintenanceDto) {
    return this.maintenanceService.schedule(dto);
  }

  @Patch(':id/complete')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  complete(@Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    return this.maintenanceService.complete(id, dto);
  }

  @Get()
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.maintenanceService.findByAsset(assetId);
  }
}