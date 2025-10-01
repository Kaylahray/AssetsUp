import { Controller, Post, Body, Get, Param, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssetMaintenanceService } from './asset-maintenance.service';
import { ScheduleMaintenanceDto } from './dto/schedule-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';

@ApiTags('Asset Maintenance')
@Controller('asset-maintenance')
export class AssetMaintenanceController {
  constructor(private readonly maintenanceService: AssetMaintenanceService) {}

  @Post('schedule')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Schedule asset maintenance' })
  @ApiResponse({ status: 201, description: 'Maintenance scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiBody({ type: ScheduleMaintenanceDto })
  schedule(@Body() dto: ScheduleMaintenanceDto) {
    return this.maintenanceService.schedule(dto);
  }

  @Patch(':id/complete')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Complete scheduled maintenance' })
  @ApiParam({ name: 'id', description: 'Maintenance record ID' })
  @ApiResponse({ status: 200, description: 'Maintenance completed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Maintenance record not found' })
  @ApiBody({ type: CompleteMaintenanceDto })
  complete(@Param('id') id: string, @Body() dto: CompleteMaintenanceDto) {
    return this.maintenanceService.complete(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance records' })
  @ApiResponse({ status: 200, description: 'Maintenance records retrieved successfully' })
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get maintenance records for an asset' })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset maintenance records retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findByAsset(@Param('assetId') assetId: string) {
    return this.maintenanceService.findByAsset(assetId);
  }
}