import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role and optionally assign permissions' })
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all roles with their permissions' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions assigned to a role' })
  @ApiParam({ name: 'id', type: 'string' })
  findPermissions(@Param('id') id: string) {
    return this.service.findPermissions(id);
  }
}