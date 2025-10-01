import { Controller, Post, Body } from '@nestjs/common';
import { AssetTransfersService } from './asset-transfers.service';
import { InitiateTransferDto } from './dto/initiate-transfer.dto';

@Controller('asset-transfers')
export class AssetTransfersController {
  constructor(private readonly service: AssetTransfersService) {}

  @Post('initiate')
  initiate(@Body() dto: InitiateTransferDto) {
    return this.service.initiateTransfer(dto);
  }
}


