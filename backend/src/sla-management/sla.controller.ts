import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SLAService } from './sla.service';
import { CreateSLARecordDto } from './dto/create-sla-record.dto';
import { UpdateSLARecordDto } from './dto/update-sla-record.dto';
import { CreateSLABreachDto } from './dto/create-sla-breach.dto';
import { SLAQueryDto } from './dto/sla-query.dto';

@ApiTags('SLA Management')
@Controller('sla')
export class SLAController {
  constructor(private readonly slaService: SLAService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new SLA record' })
  @ApiResponse({ status: 201, description: 'SLA record created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createSLARecordDto: CreateSLARecordDto) {
    return await this.slaService.create(createSLARecordDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all SLA records with filtering' })
  @ApiResponse({ status: 200, description: 'SLA records retrieved successfully' })
  async findAll(@Query() queryDto: SLAQueryDto) {
    return await this.slaService.findAll(queryDto);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get SLA records expiring within specified days' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (default: 30)' })
  @ApiResponse({ status: 200, description: 'Expiring SLA records retrieved successfully' })
  async findExpiring(@Query('days') days?: number) {
    return await this.slaService.findExpiring(days);
  }

  @Get('expired')
  @ApiOperation({ summary: 'Get expired SLA records' })
  @ApiResponse({ status: 200, description: 'Expired SLA records retrieved successfully' })
  async findExpired() {
    return await this.slaService.findExpired();
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get SLA records by vendor ID' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor SLA records retrieved successfully' })
  async findByVendor(@Param('vendorId') vendorId: string) {
    return await this.slaService.findByVendor(vendorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SLA record by ID' })
  @ApiParam({ name: 'id', description: 'SLA record ID' })
  @ApiResponse({ status: 200, description: 'SLA record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'SLA record not found' })
  async findOne(@Param('id') id: string) {
    return await this.slaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SLA record' })
  @ApiParam({ name: 'id', description: 'SLA record ID' })
  @ApiResponse({ status: 200, description: 'SLA record updated successfully' })
  @ApiResponse({ status: 404, description: 'SLA record not found' })
  async update(@Param('id') id: string, @Body() updateSLARecordDto: UpdateSLARecordDto) {
    return await this.slaService.update(id, updateSLARecordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete SLA record' })
  @ApiParam({ name: 'id', description: 'SLA record ID' })
  @ApiResponse({ status: 204, description: 'SLA record deleted successfully' })
  @ApiResponse({ status: 404, description: 'SLA record not found' })
  async remove(@Param('id') id: string) {
    await this.slaService.remove(id);
  }

  // SLA Breach Management Endpoints
  @Post('breach')
  @ApiOperation({ summary: 'Create a new SLA breach record' })
  @ApiResponse({ status: 201, description: 'SLA breach created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createBreach(@Body() createSLABreachDto: CreateSLABreachDto) {
    return await this.slaService.createBreach(createSLABreachDto);
  }

  @Get(':id/breaches')
  @ApiOperation({ summary: 'Get all breaches for a specific SLA record' })
  @ApiParam({ name: 'id', description: 'SLA record ID' })
  @ApiResponse({ status: 200, description: 'SLA breaches retrieved successfully' })
  async findBreachesBySLA(@Param('id') slaRecordId: string) {
    return await this.slaService.findBreachesBySLA(slaRecordId);
  }

  @Patch('breach/:breachId/resolve')
  @ApiOperation({ summary: 'Resolve an SLA breach' })
  @ApiParam({ name: 'breachId', description: 'SLA breach ID' })
  @ApiResponse({ status: 200, description: 'SLA breach resolved successfully' })
  @ApiResponse({ status: 404, description: 'SLA breach not found' })
  async resolveBreach(
    @Param('breachId') breachId: string,
    @Body('resolutionNotes') resolutionNotes?: string,
  ) {
    return await this.slaService.resolveBreach(breachId, resolutionNotes);
  }

  // Mock breach trigger for testing
  @Post(':id/mock-breach')
  @ApiOperation({ summary: 'Trigger a mock SLA breach for testing purposes' })
  @ApiParam({ name: 'id', description: 'SLA record ID' })
  @ApiResponse({ status: 201, description: 'Mock breach triggered successfully' })
  async mockBreachTrigger(
    @Param('id') slaRecordId: string,
    @Body('description') description?: string,
  ) {
    return await this.slaService.mockBreachTrigger(slaRecordId, description);
  }
}
