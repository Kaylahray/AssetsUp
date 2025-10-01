import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new settings' })
  @ApiResponse({ status: 201, description: 'Settings created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateSettingsDto })
  create(@Body() createSettingsDto: CreateSettingsDto) {
    return this.settingsService.create(createSettingsDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update settings' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @ApiBody({ type: UpdateSettingsDto })
  update(@Param('id') id: string, @Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.update(id, updateSettingsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete settings' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 200, description: 'Settings deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}