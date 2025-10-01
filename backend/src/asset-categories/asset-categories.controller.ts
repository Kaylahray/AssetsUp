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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssetCategoriesService } from './asset-categories.service';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';

@ApiTags('Asset Categories')
@Controller('asset-categories')
export class AssetCategoriesController {
  constructor(private readonly assetCategoriesService: AssetCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new asset category' })
  @ApiResponse({ status: 201, description: 'Asset category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateAssetCategoryDto })
  create(@Body() createAssetCategoryDto: CreateAssetCategoryDto) {
    return this.assetCategoriesService.create(createAssetCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset categories' })
  @ApiResponse({ status: 200, description: 'Asset categories retrieved successfully' })
  findAll() {
    return this.assetCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset category by ID' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetCategoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update asset category details' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset category updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset category not found' })
  @ApiBody({ type: UpdateAssetCategoryDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetCategoryDto: UpdateAssetCategoryDto,
  ) {
    return this.assetCategoriesService.update(id, updateAssetCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete asset category' })
  @ApiParam({ name: 'id', description: 'Asset category ID', type: Number })
  @ApiResponse({ status: 204, description: 'Asset category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset category not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetCategoriesService.remove(id);
  }
}