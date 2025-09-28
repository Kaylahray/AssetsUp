import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetCategory } from './asset-category.entity';
import { CreateAssetCategoryDto } from './dto/asset-category.dto';
import { UpdateAssetCategoryDto } from './dto/asset-category.dto';

@Injectable()
export class AssetCategoriesService {
  constructor(
    @InjectRepository(AssetCategory)
    private readonly assetCategoryRepository: Repository<AssetCategory>,
  ) {}

  async create(createAssetCategoryDto: CreateAssetCategoryDto): Promise<AssetCategory> {
    try {
      const assetCategory = this.assetCategoryRepository.create(createAssetCategoryDto);
      return await this.assetCategoryRepository.save(assetCategory);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Asset category with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<AssetCategory[]> {
    return await this.assetCategoryRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<AssetCategory> {
    const assetCategory = await this.assetCategoryRepository.findOne({
      where: { id },
    });

    if (!assetCategory) {
      throw new NotFoundException(`Asset category with ID ${id} not found`);
    }

    return assetCategory;
  }

  async update(id: number, updateAssetCategoryDto: UpdateAssetCategoryDto): Promise<AssetCategory> {
    const assetCategory = await this.findOne(id);

    try {
      Object.assign(assetCategory, updateAssetCategoryDto);
      return await this.assetCategoryRepository.save(assetCategory);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Asset category with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const assetCategory = await this.findOne(id);
    await this.assetCategoryRepository.remove(assetCategory);
  }
}
