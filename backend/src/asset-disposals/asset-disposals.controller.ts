import { Controller, Post, Body, Get, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { AssetDisposalsService } from './asset-disposals.service';
import { CreateAssetDisposalDto } from './dto/create-asset-disposal.dto';

@Controller('asset-disposals')
export class AssetDisposalsController {
  constructor(private readonly disposalsService: AssetDisposalsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  markDisposed(@Body() dto: CreateAssetDisposalDto) {
    return this.disposalsService.markDisposed(dto);
  }

  @Get()
  findAll() {
    return this.disposalsService.findAll();
  }

  @Get('asset/:assetId')
  findByAsset(@Param('assetId') assetId: string) {
    return this.disposalsService.findByAsset(assetId);
  }
}