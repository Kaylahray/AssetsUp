import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import { BarcodeService } from './barcodes.service';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('barcodes')
export class BarcodeController {
  constructor(private barcodeService: BarcodeService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new barcode' })
  @ApiResponse({
    status: 201,
    description: 'Barcode successfully generated',
    schema: {
      example: {
        id: 'uuid',
        referenceId: 'ASSET-123456',
        code: 'randomlyGeneratedCode',
        type: 'QR',
        imagePath: '/uploads/barcodes/ASSET-123456.png',
      },
    },
  })
  create(@Body() dto: CreateBarcodeDto) {
    return this.barcodeService.generateBarcode(dto);
  }

  @Get(':referenceId')
  @ApiOperation({ summary: 'Get a barcode by reference ID' })
  @ApiParam({
    name: 'referenceId',
    description: 'Unique asset/item reference ID',
    example: 'ASSET-123456',
  })
  @ApiResponse({
    status: 200,
    description: 'Barcode retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        referenceId: 'ASSET-123456',
        code: 'randomlyGeneratedCode',
        type: 'QR',
        imagePath: '/uploads/barcodes/ASSET-123456.png',
      },
    },
  })
  find(@Param('referenceId') referenceId: string) {
    return this.barcodeService.findByReferenceId(referenceId);
  }

  @Post(':referenceId/regenerate')
  @ApiOperation({ summary: 'Regenerate a barcode for a reference ID' })
  @ApiResponse({
    status: 200,
    description: 'Barcode successfully regenerated',
    schema: {
      example: {
        id: 'uuid',
        referenceId: 'ASSET-123456',
        code: 'newlyGeneratedCode',
        type: 'CODE128',
        imagePath: '/uploads/barcodes/ASSET-123456.png',
      },
    },
  })
  regenerate(@Param('referenceId') referenceId: string) {
    return this.barcodeService.regenerate(referenceId);
  }
}