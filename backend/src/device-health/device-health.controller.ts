import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DeviceHealthService } from './device-health.service';
import { CreateDeviceHealthDto, DeviceHealthQueryDto } from './dto/create-device-health.dto';
import { DeviceStatus, DeviceType } from './entities/device-health.entity';

@ApiTags('Device Health')
@Controller('device-health')
export class DeviceHealthController {
  constructor(private readonly deviceHealthService: DeviceHealthService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device health record' })
  @ApiResponse({ status: 201, description: 'Device health record created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateDeviceHealthDto) {
    return {
      status: 'success',
      message: 'Device health record created successfully',
      data: await this.deviceHealthService.create(createDto),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all device health records with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Device health records retrieved successfully' })
  @ApiQuery({ name: 'deviceId', required: false, description: 'Filter by device ID' })
  @ApiQuery({ name: 'status', required: false, enum: DeviceStatus, description: 'Filter by device status' })
  @ApiQuery({ name: 'deviceType', required: false, enum: DeviceType, description: 'Filter by device type' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'], description: 'Sort order' })
  async findAll(@Query() queryDto: DeviceHealthQueryDto) {
    const result = await this.deviceHealthService.findAll(queryDto);
    return {
      status: 'success',
      message: 'Device health records retrieved successfully',
      ...result,
    };
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest health status for all devices' })
  @ApiResponse({ status: 200, description: 'Latest device health status retrieved successfully' })
  async getLatestHealthStatus() {
    return {
      status: 'success',
      message: 'Latest device health status retrieved successfully',
      data: await this.deviceHealthService.findLatestByDevice(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get device health statistics' })
  @ApiResponse({ status: 200, description: 'Device health statistics retrieved successfully' })
  async getHealthStats() {
    return {
      status: 'success',
      message: 'Device health statistics retrieved successfully',
      data: await this.deviceHealthService.getHealthStats(),
    };
  }

  @Get('device/:deviceId/latest')
  @ApiOperation({ summary: 'Get latest health status for a specific device' })
  @ApiResponse({ status: 200, description: 'Latest device health status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  @ApiParam({ name: 'deviceId', description: 'Device ID' })
  async getLatestByDevice(@Param('deviceId') deviceId: string) {
    return {
      status: 'success',
      message: 'Latest device health status retrieved successfully',
      data: await this.deviceHealthService.findLatestByDeviceId(deviceId),
    };
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Manually trigger device health simulation' })
  @ApiResponse({ status: 200, description: 'Device health simulation triggered successfully' })
  async triggerSimulation() {
    await this.deviceHealthService.triggerSimulation();
    return {
      status: 'success',
      message: 'Device health simulation completed successfully',
    };
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get list of all monitored devices' })
  @ApiResponse({ status: 200, description: 'Device list retrieved successfully' })
  async getDeviceList() {
    const latestDevices = await this.deviceHealthService.findLatestByDevice();
    const devices = latestDevices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      status: device.status,
      lastSeen: device.lastSeen,
    }));

    return {
      status: 'success',
      message: 'Device list retrieved successfully',
      data: devices,
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get devices with critical or warning status' })
  @ApiResponse({ status: 200, description: 'Device alerts retrieved successfully' })
  async getDeviceAlerts() {
    const latestDevices = await this.deviceHealthService.findLatestByDevice();
    const alerts = latestDevices.filter(device => 
      device.status === DeviceStatus.CRITICAL || 
      device.status === DeviceStatus.WARNING ||
      device.status === DeviceStatus.OFFLINE
    );

    return {
      status: 'success',
      message: 'Device alerts retrieved successfully',
      data: alerts,
      count: alerts.length,
    };
  }
}