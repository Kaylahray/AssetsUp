import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateDepartmentDto })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments or filter by company' })
  @ApiQuery({ name: 'companyId', required: false, type: Number, description: 'Filter by company ID' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  findAll(@Query('companyId') companyId?: string) {
    if (companyId) {
      return this.departmentsService.findByCompany(parseInt(companyId));
    }
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiParam({ name: 'id', description: 'Department ID', type: Number })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get department statistics' })
  @ApiParam({ name: 'id', description: 'Department ID', type: Number })
  @ApiResponse({ status: 200, description: 'Department statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  getStats(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.getDepartmentStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department details' })
  @ApiParam({ name: 'id', description: 'Department ID', type: Number })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiBody({ type: UpdateDepartmentDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete department' })
  @ApiParam({ name: 'id', description: 'Department ID', type: Number })
  @ApiResponse({ status: 204, description: 'Department deleted successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.departmentsService.remove(id);
  }
}