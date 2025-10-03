import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new branch' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateBranchDto })
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'Branches retrieved successfully' })
  findAll() {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiParam({ name: 'id', description: 'Branch ID', type: Number })
  @ApiResponse({ status: 200, description: 'Branch retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch details' })
  @ApiParam({ name: 'id', description: 'Branch ID', type: Number })
  @ApiResponse({ status: 200, description: 'Branch updated successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  @ApiBody({ type: UpdateBranchDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return this.branchesService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch' })
  @ApiParam({ name: 'id', description: 'Branch ID', type: Number })
  @ApiResponse({ status: 200, description: 'Branch deleted successfully' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.branchesService.remove(id);
  }
}