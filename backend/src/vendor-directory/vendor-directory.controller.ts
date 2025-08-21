import { Controller, Get, Post, Body, Param, Put, Delete, Query, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VendorDirectoryService } from './vendor-directory.service';
import { CreateVendorDto, UpdateVendorDto, VendorFilterDto } from './dto/vendor.dto';
import { Vendor } from './entities/vendor.entity';

@ApiTags('vendor-directory')
@Controller('vendor-directory')
export class VendorDirectoryController {
  constructor(private readonly vendorDirectoryService: VendorDirectoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vendor profile' })
  @ApiResponse({ status: 201, description: 'Vendor profile created successfully.' })
  @ApiResponse({ status: 409, description: 'Vendor with this registration number already exists.' })
  async create(@Body() createVendorDto: CreateVendorDto): Promise<Vendor> {
    return await this.vendorDirectoryService.create(createVendorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vendors with optional filters' })
  @ApiResponse({ status: 200, description: 'Returns all vendor profiles matching the filters.' })
  async findAll(@Query() filters: VendorFilterDto): Promise<Vendor[]> {
    return await this.vendorDirectoryService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vendor by ID' })
  @ApiResponse({ status: 200, description: 'Returns the vendor profile.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async findOne(@Param('id') id: string): Promise<Vendor> {
    return await this.vendorDirectoryService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vendor profile' })
  @ApiResponse({ status: 200, description: 'Vendor profile updated successfully.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ): Promise<Vendor> {
    return await this.vendorDirectoryService.update(id, updateVendorDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Soft delete a vendor profile' })
  @ApiResponse({ status: 204, description: 'Vendor profile deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.vendorDirectoryService.softDelete(id);
  }

  @Get('registration/:number')
  @ApiOperation({ summary: 'Find vendor by registration number' })
  @ApiResponse({ status: 200, description: 'Returns the vendor profile.' })
  @ApiResponse({ status: 404, description: 'Vendor not found.' })
  async findByRegistrationNumber(@Param('number') registrationNumber: string): Promise<Vendor> {
    const vendor = await this.vendorDirectoryService.findByRegistrationNumber(registrationNumber);
    if (!vendor) {
      throw new NotFoundException(`Vendor with registration number "${registrationNumber}" not found`);
    }
    return vendor;
  }
}
