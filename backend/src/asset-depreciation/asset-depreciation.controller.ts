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
import { AssetDepreciationService } from './asset-depreciation.service';
import {
  CreateAssetDepreciationDto,
  UpdateAssetDepreciationDto,
  DepreciatedValueResponseDto,
  AssetDepreciationSummaryDto,
} from './dto/asset-depreciation.dto';
import { AssetDepreciation } from './entities/asset-depreciation.entity';

@Controller('asset-depreciation')
export class AssetDepreciationController {
  constructor(private readonly assetDepreciationService: AssetDepreciationService) {}

  /**
   * Create a new asset depreciation record
   * POST /asset-depreciation
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(ValidationPipe) createAssetDepreciationDto: CreateAssetDepreciationDto,
  ): Promise<AssetDepreciation> {
    return this.assetDepreciationService.create(createAssetDepreciationDto);
  }

  /**
   * Get all asset depreciation records with optional filtering
   * GET /asset-depreciation?isFullyDepreciated=true&depreciationMethod=straight_line&minValue=1000&maxValue=50000
   */
  @Get()
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

  /**
   * Get depreciation summary statistics
   * GET /asset-depreciation/summary
   */
  @Get('summary')
  getSummary(): Promise<AssetDepreciationSummaryDto> {
    return this.assetDepreciationService.getSummary();
  }

  /**
   * Get all current depreciated values
   * GET /asset-depreciation/current-values
   */
  @Get('current-values')
  getAllCurrentValues(): Promise<DepreciatedValueResponseDto[]> {
    return this.assetDepreciationService.getAllCurrentValues();
  }

  /**
   * Get fully depreciated assets
   * GET /asset-depreciation/fully-depreciated
   */
  @Get('fully-depreciated')
  getFullyDepreciatedAssets(): Promise<DepreciatedValueResponseDto[]> {
    return this.assetDepreciationService.getFullyDepreciatedAssets();
  }

  /**
   * Get assets nearing end of useful life
   * GET /asset-depreciation/nearing-end-of-life?threshold=1
   */
  @Get('nearing-end-of-life')
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

  /**
   * Get specific asset depreciation record by ID
   * GET /asset-depreciation/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AssetDepreciation> {
    return this.assetDepreciationService.findOne(id);
  }

  /**
   * Get current depreciated value of a specific asset
   * GET /asset-depreciation/:id/current-value
   */
  @Get(':id/current-value')
  getCurrentValue(@Param('id', ParseIntPipe) id: number): Promise<DepreciatedValueResponseDto> {
    return this.assetDepreciationService.getCurrentValue(id);
  }

  /**
   * Get projected value of asset at future date
   * GET /asset-depreciation/:id/projected-value?date=2025-12-31
   */
  @Get(':id/projected-value')
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

  /**
   * Update an asset depreciation record
   * PATCH /asset-depreciation/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAssetDepreciationDto: UpdateAssetDepreciationDto,
  ): Promise<AssetDepreciation> {
    return this.assetDepreciationService.update(id, updateAssetDepreciationDto);
  }

  /**
   * Delete an asset depreciation record
   * DELETE /asset-depreciation/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.assetDepreciationService.remove(id);
  }
}
