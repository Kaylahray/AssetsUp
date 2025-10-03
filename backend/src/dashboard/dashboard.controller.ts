import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard metrics retrieved successfully',
    type: DashboardMetricsDto
  })
  getMetrics() {
    return this.dashboardService.getMetrics();
  }
}