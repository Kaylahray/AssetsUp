import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssetDisposalsService } from './asset-disposals.service';
import { CreateAssetDisposalDto } from './dto/create-asset-disposal.dto';

@ApiTags('Asset Disposals')
@Controller('asset-disposals')
export class AssetDisposalsController {
  constructor(private readonly disposalsService: AssetDisposalsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Mark an asset as disposed' })
  @ApiResponse({ status: 201, description: 'Asset marked as disposed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiBody({ type: CreateAssetDisposalDto })
  markDisposed(@Body() dto: CreateAssetDisposalDto) {
    return this.disposalsService.markDisposed(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all asset disposal records' })
  @ApiResponse({ status: 200, description: 'Disposal records retrieved successfully' })
  findAll() {
    return this.disposalsService.findAll();
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get disposal records for an asset' })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset disposal records retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findByAsset(@Param('assetId') assetId: string) {
    return this.disposalsService.findByAsset(assetId);
  }
}