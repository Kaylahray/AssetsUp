import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { UsageStatsService } from './usage-stats.service';
import { CreateUsageStatDto } from './dto/create-usage-stat.dto';
import { UsageFilterDto } from './dto/usage-filter.dto';

@Controller('usage-stats')
export class UsageStatsController {
  constructor(private readonly usageStatsService: UsageStatsService) {}

  @Post()
  create(@Body() dto: CreateUsageStatDto) {
    return this.usageStatsService.create(dto);
  }

  @Get()
  findAll(@Query() filter: UsageFilterDto) {
    return this.usageStatsService.findAll(filter);
  }

  @Get('aggregate')
  aggregate(
    @Query('period') period: 'week' | 'month',
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.usageStatsService.aggregate(
      period,
      new Date(start),
      new Date(end),
    );
  }
}
