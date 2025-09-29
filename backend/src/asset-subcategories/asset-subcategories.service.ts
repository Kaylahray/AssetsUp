import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetSubcategory } from './entities/asset-subcategory.entity';
import { CreateAssetSubcategoryDto } from './dto/create-asset-subcategory.dto';
import { UpdateAssetSubcategoryDto } from './dto/update-asset-subcategory.dto';
import { AssetCategory } from '../asset-categories/asset-category.entity';

@Injectable()
export class AssetSubcategoriesService {
  constructor(
    @InjectRepository(AssetSubcategory)
    private readonly subcategoryRepo: Repository<AssetSubcategory>,
    @InjectRepository(AssetCategory)
    private readonly categoryRepo: Repository<AssetCategory>,
  ) {}

  async create(dto: CreateAssetSubcategoryDto): Promise<AssetSubcategory> {
    const parentCategory = await this.categoryRepo.findOne({ where: { id: dto.parentCategoryId } });
    if (!parentCategory) throw new NotFoundException('Parent category not found');
    const subcategory = this.subcategoryRepo.create({ ...dto, parentCategory });
    return this.subcategoryRepo.save(subcategory);
  }

  findAll(): Promise<AssetSubcategory[]> {
    return this.subcategoryRepo.find({ relations: ['parentCategory'] });
  }

  findOne(id: number): Promise<AssetSubcategory> {
    return this.subcategoryRepo.findOne({ where: { id }, relations: ['parentCategory'] });
  }

  async update(id: number, dto: UpdateAssetSubcategoryDto): Promise<AssetSubcategory> {
    const subcategory = await this.subcategoryRepo.findOne({ where: { id } });
    if (!subcategory) throw new NotFoundException('Subcategory not found');
    if (dto.parentCategoryId) {
      const parentCategory = await this.categoryRepo.findOne({ where: { id: dto.parentCategoryId } });
      if (!parentCategory) throw new NotFoundException('Parent category not found');
      subcategory.parentCategory = parentCategory;
    }
    if (dto.name) subcategory.name = dto.name;
    return this.subcategoryRepo.save(subcategory);
  }

  async remove(id: number): Promise<void> {
    await this.subcategoryRepo.delete(id);
  }
}
