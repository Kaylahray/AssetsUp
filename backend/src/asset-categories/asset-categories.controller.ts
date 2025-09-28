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
import { AssetCategoriesService } from './asset-categories.service';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto';

@Controller('asset-categories')
export class AssetCategoriesController {
  constructor(private readonly assetCategoriesService: AssetCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAssetCategoryDto: CreateAssetCategoryDto) {
    return this.assetCategoriesService.create(createAssetCategoryDto);
  }

  @Get()
  findAll() {
    return this.assetCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetCategoryDto: UpdateAssetCategoryDto,
  ) {
    return this.assetCategoriesService.update(id, updateAssetCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetCategoriesService.remove(id);
  }
}
