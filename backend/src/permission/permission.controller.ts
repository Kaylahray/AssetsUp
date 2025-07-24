import { Controller, Post, Body, Get } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permission.service';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a permission' })
  create(@Body() dto: CreatePermissionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all permissions' })
  findAll() {
    return this.service.findAll();
  }
}