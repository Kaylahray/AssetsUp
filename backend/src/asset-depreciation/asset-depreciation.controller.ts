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
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AssetDepreciationService } from './asset-depreciation.service';
import {
  CreateAssetDepreciationDto,
  UpdateAssetDepreciationDto,
  DepreciatedValueResponseDto,
  AssetDepreciationSummaryDto,
} from './dto/asset-depreciation.dto';
import { AssetDepreciation } from './entities/asset-depreciation.entity';

@ApiTags('Asset Depreciation')
@Controller('asset-depreciation')
export class AssetDepreciationController {
  constructor(private readonly assetDepreciationService: AssetDepreciationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new asset depreciation record' })
  @ApiResponse({ status: 201, description: 'Asset depreciation record created successfully', type: AssetDepreciation })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateAssetDepreciationDto })
  create(
    @Body(ValidationPipe) createAssetDepreciationDto: CreateAssetDepreciationDto,
  ): Promise<AssetDepreciation> {
    return this.assetDepreciationService.create(createAssetDepreciationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset depreciation records with optional filtering' })
  @ApiQuery({ name: 'isFullyDepreciated', required: false, type: Boolean, description: 'Filter by fully depreciated status' })
  @ApiQuery({ name: 'depreciationMethod', required: false, description: 'Filter by depreciation method' })
  @ApiQuery({ name: 'minValue', required: false, type: Number, description: 'Minimum current value filter' })
  @ApiQuery({ name: 'maxValue', required: false, type: Number, description: 'Maximum current value filter' })
  @ApiResponse({ status: 200, description: 'Asset depreciation records retrieved successfully', type: [AssetDepreciation] })
  findAll(
    @Query('isFullyDepreciated') isFullyDepreciated?: string,
    @Query('depreciationMethod') depreciationMethod?: string,
    @Query('minValue') minValue?: string,
    @Query('maxValue') maxValue?: string,
  ): Promise<AssetDepreciation[]> {
    const filters: any = {};

    if (isFullyDepreciated !== undefined) {
      if (isFullyDepreciated === 'true') {
        filters.isFullyDepreciated = true;
      } else if (isFullyDepreciated === 'false') {
        filters.isFullyDepreciated = false;
      }
    }

    if (depreciationMethod) {
      filters.depreciationMethod = depreciationMethod;
    }

    if (minValue) {
      const minVal = parseFloat(minValue);
      if (isNaN(minVal) || minVal < 0) {
        throw new BadRequestException('minValue must be a positive number');
      }
      filters.minValue = minVal;
    }

    if (maxValue) {
      const maxVal = parseFloat(maxValue);
      if (isNaN(maxVal) || maxVal < 0) {
        throw new BadRequestException('maxValue must be a positive number');
      }
      filters.maxValue = maxVal;
    }

    return this.assetDepreciationService.findAll(filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get depreciation summary statistics' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully', type: AssetDepreciationSummaryDto })
  getSummary(): Promise<AssetDepreciationSummaryDto> {
    return this.assetDepreciationService.getSummary();
  }

  @Get('current-values')
  @ApiOperation({ summary: 'Get all current depreciated values' })
  @ApiResponse({ status: 200, description: 'Current values retrieved successfully', type: [DepreciatedValueResponseDto] })
  getAllCurrentValues(): Promise<DepreciatedValueResponseDto[]> {
    return this.assetDepreciationService.getAllCurrentValues();
  }

  @Get('fully-depreciated')
  @ApiOperation({ summary: 'Get fully depreciated assets' })
  @ApiResponse({ status: 200, description: 'Fully depreciated assets retrieved successfully', type: [DepreciatedValueResponseDto] })
  getFullyDepreciatedAssets(): Promise<DepreciatedValueResponseDto[]> {
    return this.assetDepreciationService.getFullyDepreciatedAssets();
  }

  @Get('nearing-end-of-life')
  @ApiOperation({ summary: 'Get assets nearing end of useful life' })
  @ApiQuery({ name: 'threshold', required: false, type: Number, description: 'Threshold in years (default: 1)' })
  @ApiResponse({ status: 200, description: 'Assets nearing end of life retrieved successfully', type: [DepreciatedValueResponseDto] })
  getAssetsNearingEndOfLife(
    @Query('threshold') threshold?: string,
  ): Promise<DepreciatedValueResponseDto[]> {
    let thresholdYears = 1; // default
    if (threshold) {
      const parsedThreshold = parseFloat(threshold);
      if (isNaN(parsedThreshold) || parsedThreshold <= 0) {
        throw new BadRequestException('Threshold must be a positive number');
      }
      thresholdYears = parsedThreshold;
    }
    return this.assetDepreciationService.getAssetsNearingEndOfLife(thresholdYears);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific asset depreciation record by ID' })
  @ApiParam({ name: 'id', description: 'Asset depreciation record ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset depreciation record retrieved successfully', type: AssetDepreciation })
  @ApiResponse({ status: 404, description: 'Asset depreciation record not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AssetDepreciation> {
    return this.assetDepreciationService.findOne(id);
  }

  @Get(':id/current-value')
  @ApiOperation({ summary: 'Get current depreciated value of a specific asset' })
  @ApiParam({ name: 'id', description: 'Asset depreciation record ID', type: Number })
  @ApiResponse({ status: 200, description: 'Current value retrieved successfully', type: DepreciatedValueResponseDto })
  @ApiResponse({ status: 404, description: 'Asset depreciation record not found' })
  getCurrentValue(@Param('id', ParseIntPipe) id: number): Promise<DepreciatedValueResponseDto> {
    return this.assetDepreciationService.getCurrentValue(id);
  }

  @Get(':id/projected-value')
  @ApiOperation({ summary: 'Get projected value of asset at future date' })
  @ApiParam({ name: 'id', description: 'Asset depreciation record ID', type: Number })
  @ApiQuery({ name: 'date', required: true, description: 'Future date (YYYY-MM-DD format)' })
  @ApiResponse({ status: 200, description: 'Projected value calculated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 404, description: 'Asset depreciation record not found' })
  async getProjectedValue(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ): Promise<{
    assetName: string;
    currentValue: number;
    projectedValue: number;
    depreciationBetween: number;
  }> {
    if (!date) {
      throw new BadRequestException('Date query parameter is required (format: YYYY-MM-DD)');
    }

    const futureDate = new Date(date);
    if (isNaN(futureDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
    }

    return this.assetDepreciationService.getProjectedValue(id, futureDate);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset depreciation record' })
  @ApiParam({ name: 'id', description: 'Asset depreciation record ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset depreciation record updated successfully', type: AssetDepreciation })
  @ApiResponse({ status: 404, description: 'Asset depreciation record not found' })
  @ApiBody({ type: UpdateAssetDepreciationDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAssetDepreciationDto: UpdateAssetDepreciationDto,
  ): Promise<AssetDepreciation> {
    return this.assetDepreciationService.update(id, updateAssetDepreciationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an asset depreciation record' })
  @ApiParam({ name: 'id', description: 'Asset depreciation record ID', type: Number })
  @ApiResponse({ status: 204, description: 'Asset depreciation record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset depreciation record not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetDepreciationService.remove(id);
  }
}