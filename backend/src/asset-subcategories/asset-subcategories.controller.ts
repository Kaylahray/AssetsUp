import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { AssetSubcategoriesService } from './asset-subcategories.service';
import { CreateAssetSubcategoryDto } from './dto/create-asset-subcategory.dto';
import { UpdateAssetSubcategoryDto } from './dto/update-asset-subcategory.dto';

@Controller('asset-subcategories')
export class AssetSubcategoriesController {
  constructor(private readonly service: AssetSubcategoriesService) {}

  @Post()
  create(@Body() dto: CreateAssetSubcategoryDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAssetSubcategoryDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
