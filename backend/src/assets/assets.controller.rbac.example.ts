import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Assets with RBAC')
@Controller('api/v1/assets-rbac')
@UseGuards(RolesGuard)
export class AssetsRbacController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @Roles(Role.Admin, Role.Manager)
  @ApiOperation({ summary: 'Register a new asset (Admin/Manager only)' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiBody({ type: CreateAssetDto })
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Get()
  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @ApiOperation({ summary: 'Get all registered assets (All roles)' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Manager, Role.Employee)
  @ApiOperation({ summary: 'Get an asset by ID (All roles)' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Manager)
  @ApiOperation({ summary: 'Update an asset (Admin/Manager only)' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiBody({ type: UpdateAssetDto })
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete an asset (Admin only)' })
  @ApiParam({ name: 'id', description: 'Asset ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}