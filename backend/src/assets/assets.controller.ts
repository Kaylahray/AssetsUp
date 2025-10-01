import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Assets')
@Controller('api/v1/assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registered assets' })
  findAll() {
    return this.assetsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an asset by ID' })
  findOne(@Param('id') id: string) {
    return this.assetsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  update(@Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.assetsService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset' })
  remove(@Param('id') id: string) {
    return this.assetsService.remove(+id);
  }
}
