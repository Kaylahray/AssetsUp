import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { DisposalRegistryService } from './disposal-registry.service';
import { CreateDisposalDto, DisposalFilterDto, UpdateDisposalDto } from './dto/disposal.dto';
import { DisposalRecord } from './entities/disposal.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('disposal-registry')
@Controller('disposal-registry')
export class DisposalRegistryController {
  constructor(private readonly disposalRegistryService: DisposalRegistryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new disposal record' })
  @ApiResponse({ status: 201, description: 'The disposal record has been successfully created.' })
  async create(@Body() createDisposalDto: CreateDisposalDto): Promise<DisposalRecord> {
    return await this.disposalRegistryService.create(createDisposalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all disposal records with optional filters' })
  @ApiResponse({ status: 200, description: 'Return all disposal records matching the filters.' })
  async findAll(@Query() filters: DisposalFilterDto): Promise<DisposalRecord[]> {
    return await this.disposalRegistryService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific disposal record by ID' })
  @ApiResponse({ status: 200, description: 'Return the disposal record.' })
  @ApiResponse({ status: 404, description: 'Disposal record not found.' })
  async findOne(@Param('id') id: string): Promise<DisposalRecord> {
    return await this.disposalRegistryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a disposal record' })
  @ApiResponse({ status: 200, description: 'The disposal record has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Disposal record not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDisposalDto: UpdateDisposalDto,
  ): Promise<DisposalRecord> {
    return await this.disposalRegistryService.update(id, updateDisposalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a disposal record' })
  @ApiResponse({ status: 200, description: 'The disposal record has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Disposal record not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.disposalRegistryService.softDelete(id);
  }
}
