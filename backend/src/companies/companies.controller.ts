import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateCompanyDto })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({ name: 'id', description: 'Company ID', type: Number })
  @ApiResponse({ status: 200, description: 'Company retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company details' })
  @ApiParam({ name: 'id', description: 'Company ID', type: Number })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiBody({ type: UpdateCompanyDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiParam({ name: 'id', description: 'Company ID', type: Number })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.remove(id);
  }
}