import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatusHistoryService } from './status-history.service';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';

@ApiTags('status-history')
@Controller('status-history')
export class StatusHistoryController {
  constructor(private readonly service: StatusHistoryService) {}

  @Post()
  async create(@Body() dto: CreateStatusHistoryDto) {
    return this.service.logStatusChange(dto);
  }

  @Get(':assetId')
  async getByAsset(@Param('assetId') assetId: string) {
    return this.service.getByAsset(assetId);
  }
}
