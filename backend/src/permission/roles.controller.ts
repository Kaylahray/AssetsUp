import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a role and optionally assign permissions' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: Role })
  create(@Body() dto: CreateRoleDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'All roles and their assigned permissions', type: [Role] })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions assigned to a specific role' })
  @ApiParam({ name: 'id', description: 'Role ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Permissions for the role', type: [Permission] })
  findPermissions(@Param('id') id: string) {
    return this.service.findPermissions(id);
  }
}