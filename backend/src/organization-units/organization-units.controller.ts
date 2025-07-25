import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationUnitsService } from './organization-units.service';
import { CreateOrganizationUnitDto } from './dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from './dto/update-organization-unit.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('organization-units')
@Controller('organization-units')
export class OrganizationUnitsController {
  constructor(private readonly orgUnitsService: OrganizationUnitsService) {}

  @Post()
  create(@Body() dto: CreateOrganizationUnitDto) {
    return this.orgUnitsService.create(dto);
  }

  @Get()
  findAll() {
    return this.orgUnitsService.findAll();
  }

  @Get('tree')
  getTree() {
    return this.orgUnitsService.getTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgUnitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationUnitDto) {
    return this.orgUnitsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgUnitsService.remove(id);
  }
} 