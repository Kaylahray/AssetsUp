import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AssetTransfersService } from './asset-transfers.service';
import { InitiateTransferDto } from './dto/initiate-transfer.dto';

@ApiTags('Asset Transfers')
@Controller('asset-transfers')
export class AssetTransfersController {
  constructor(private readonly service: AssetTransfersService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate an asset transfer between departments' })
  @ApiResponse({ status: 201, description: 'Asset transfer initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transfer request' })
  @ApiResponse({ status: 404, description: 'Asset or department not found' })
  @ApiBody({ type: InitiateTransferDto })
  initiate(@Body() dto: InitiateTransferDto) {
    return this.service.initiateTransfer(dto);
  }
}