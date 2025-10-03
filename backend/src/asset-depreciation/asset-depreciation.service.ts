import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AssetDepreciation } from './entities/asset-depreciation.entity';
import {
  CreateAssetDepreciationDto,
  UpdateAssetDepreciationDto,
  DepreciatedValueResponseDto,
  AssetDepreciationSummaryDto,
} from './dto/asset-depreciation.dto';

@Injectable()
export class AssetDepreciationService {
  constructor(
    @InjectRepository(AssetDepreciation)
    private readonly assetDepreciationRepository: Repository<AssetDepreciation>,
  ) {}

  /**
   * Create a new asset depreciation record
   */
  async create(createAssetDepreciationDto: CreateAssetDepreciationDto): Promise<AssetDepreciation> {
    // Validate purchase date is not in the future
    const purchaseDate = new Date(createAssetDepreciationDto.purchaseDate);
    if (purchaseDate > new Date()) {
      throw new BadRequestException('Purchase date cannot be in the future');
    }

    // Validate salvage value is not greater than purchase price
    if (
      createAssetDepreciationDto.salvageValue &&
      createAssetDepreciationDto.salvageValue >= createAssetDepreciationDto.purchasePrice
    ) {
      throw new BadRequestException('Salvage value cannot be greater than or equal to purchase price');
    }

    try {
      const assetDepreciation = this.assetDepreciationRepository.create({
        ...createAssetDepreciationDto,
        purchaseDate,
      });
      
      return await this.assetDepreciationRepository.save(assetDepreciation);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Asset with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Find all asset depreciation records with optional filtering
   */
  async findAll(filters?: {
    isFullyDepreciated?: boolean;
    depreciationMethod?: string;
    minValue?: number;
    maxValue?: number;
  }): Promise<AssetDepreciation[]> {
    let query = this.assetDepreciationRepository
      .createQueryBuilder('asset')
      .orderBy('asset.createdAt', 'DESC');

    // Apply filters if provided
    if (filters?.depreciationMethod) {
      query = query.andWhere('asset.depreciationMethod = :method', {
        method: filters.depreciationMethod,
      });
    }

    if (filters?.minValue !== undefined) {
      query = query.andWhere('asset.purchasePrice >= :minValue', {
        minValue: filters.minValue,
      });
    }

    if (filters?.maxValue !== undefined) {
      query = query.andWhere('asset.purchasePrice <= :maxValue', {
        maxValue: filters.maxValue,
      });
    }

    const assets = await query.getMany();

    // Filter by depreciation status if requested (requires calculation)
    if (filters?.isFullyDepreciated !== undefined) {
      return assets.filter(asset => 
        asset.isFullyDepreciated() === filters.isFullyDepreciated
      );
    }

    return assets;
  }

  /**
   * Find one asset depreciation record by ID
   */
  async findOne(id: number): Promise<AssetDepreciation> {
    const assetDepreciation = await this.assetDepreciationRepository.findOne({
      where: { id } as FindOptionsWhere<AssetDepreciation>,
    });

    if (!assetDepreciation) {
      throw new NotFoundException(`Asset depreciation record with ID ${id} not found`);
    }

    return assetDepreciation;
  }

  /**
   * Get current depreciated value of an asset
   */
  async getCurrentValue(id: number): Promise<DepreciatedValueResponseDto> {
    const assetDepreciation = await this.findOne(id);
    return new DepreciatedValueResponseDto(assetDepreciation);
  }

  /**
   * Get current depreciated values of all assets
   */
  async getAllCurrentValues(): Promise<DepreciatedValueResponseDto[]> {
    const assets = await this.findAll();
    return assets.map(asset => new DepreciatedValueResponseDto(asset));
  }

  /**
   * Update an asset depreciation record
   */
  async update(
    id: number,
    updateAssetDepreciationDto: UpdateAssetDepreciationDto,
  ): Promise<AssetDepreciation> {
    const assetDepreciation = await this.findOne(id);

    // Validate purchase date if being updated
    if (updateAssetDepreciationDto.purchaseDate) {
      const purchaseDate = new Date(updateAssetDepreciationDto.purchaseDate);
      if (purchaseDate > new Date()) {
        throw new BadRequestException('Purchase date cannot be in the future');
      }
      updateAssetDepreciationDto.purchaseDate = purchaseDate.toISOString().split('T')[0];
    }

    // Validate salvage value if being updated
    const newPurchasePrice = updateAssetDepreciationDto.purchasePrice || Number(assetDepreciation.purchasePrice);
    const newSalvageValue = updateAssetDepreciationDto.salvageValue !== undefined 
      ? updateAssetDepreciationDto.salvageValue 
      : assetDepreciation.salvageValue;

    if (newSalvageValue && newSalvageValue >= newPurchasePrice) {
      throw new BadRequestException('Salvage value cannot be greater than or equal to purchase price');
    }

    try {
      Object.assign(assetDepreciation, updateAssetDepreciationDto);
      return await this.assetDepreciationRepository.save(assetDepreciation);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Asset with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Remove an asset depreciation record
   */
  async remove(id: number): Promise<void> {
    const assetDepreciation = await this.findOne(id);
    await this.assetDepreciationRepository.remove(assetDepreciation);
  }

  /**
   * Get depreciation summary statistics
   */
  async getSummary(): Promise<AssetDepreciationSummaryDto> {
    const assets = await this.findAll();
    
    if (assets.length === 0) {
      return new AssetDepreciationSummaryDto({
        totalAssets: 0,
        totalPurchaseValue: 0,
        totalCurrentValue: 0,
        totalDepreciation: 0,
        fullyDepreciatedAssets: 0,
        averageAge: 0,
      });
    }

    const totalPurchaseValue = assets.reduce((sum, asset) => sum + Number(asset.purchasePrice), 0);
    const totalCurrentValue = assets.reduce((sum, asset) => sum + asset.getCurrentDepreciatedValue(), 0);
    const totalDepreciation = totalPurchaseValue - totalCurrentValue;
    const fullyDepreciatedAssets = assets.filter(asset => asset.isFullyDepreciated()).length;
    
    // Calculate average age in years
    const currentDate = new Date();
    const totalAgeInYears = assets.reduce((sum, asset) => {
      const purchaseDate = new Date(asset.purchaseDate);
      const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return sum + ageInYears;
    }, 0);
    const averageAge = totalAgeInYears / assets.length;

    return new AssetDepreciationSummaryDto({
      totalAssets: assets.length,
      totalPurchaseValue: Number(totalPurchaseValue.toFixed(2)),
      totalCurrentValue: Number(totalCurrentValue.toFixed(2)),
      totalDepreciation: Number(totalDepreciation.toFixed(2)),
      fullyDepreciatedAssets,
      averageAge: Number(averageAge.toFixed(2)),
    });
  }

  /**
   * Get assets that are fully depreciated
   */
  async getFullyDepreciatedAssets(): Promise<DepreciatedValueResponseDto[]> {
    const assets = await this.findAll({ isFullyDepreciated: true });
    return assets.map(asset => new DepreciatedValueResponseDto(asset));
  }

  /**
   * Get assets that need attention (e.g., near end of useful life)
   */
  async getAssetsNearingEndOfLife(yearsThreshold: number = 1): Promise<DepreciatedValueResponseDto[]> {
    const assets = await this.findAll();
    const assetsNearingEnd = assets.filter(asset => {
      const remainingLife = asset.getRemainingUsefulLife();
      return remainingLife > 0 && remainingLife <= yearsThreshold;
    });
    
    return assetsNearingEnd.map(asset => new DepreciatedValueResponseDto(asset));
  }

  /**
   * Calculate projected value at a future date
   */
  async getProjectedValue(id: number, futureDate: Date): Promise<{
    assetName: string;
    currentValue: number;
    projectedValue: number;
    depreciationBetween: number;
  }> {
    const asset = await this.findOne(id);
    const currentValue = asset.getCurrentDepreciatedValue();
    
    // Calculate years between now and future date
    const currentDate = new Date();
    const yearsToFuture = (futureDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (yearsToFuture <= 0) {
      throw new BadRequestException('Future date must be later than current date');
    }

    const annualDepreciation = asset.getAnnualDepreciation();
    const additionalDepreciation = Math.min(
      annualDepreciation * yearsToFuture,
      currentValue - (asset.salvageValue || 0)
    );
    
    const projectedValue = Math.max(currentValue - additionalDepreciation, asset.salvageValue || 0);

    return {
      assetName: asset.assetName,
      currentValue: Number(currentValue.toFixed(2)),
      projectedValue: Number(projectedValue.toFixed(2)),
      depreciationBetween: Number(additionalDepreciation.toFixed(2)),
    };
  }
}
