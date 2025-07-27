import { Controller, Post, Body, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { BarcodeService } from './barcode.service';
import { GenerateBarcodeDto } from './dto/generate-barcode.dto';
import { Response } from 'express';

@Controller('barcodes')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  @Post()
  async generate(@Body() dto: GenerateBarcodeDto) {
    const barcode = await this.barcodeService.generateBarcode(dto);
    return {
      id: barcode.id,
      code: barcode.code,
      format: barcode.format,
      image: barcode.image.toString('base64'),
      createdAt: barcode.createdAt,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const barcode = await this.barcodeService.getBarcode(id);
    return {
      id: barcode.id,
      code: barcode.code,
      format: barcode.format,
      image: barcode.image.toString('base64'),
      createdAt: barcode.createdAt,
    };
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const barcode = await this.barcodeService.getBarcode(id);
    const contentType = barcode.format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=barcode-${barcode.id}.${barcode.format}`);
    res.status(HttpStatus.OK).send(barcode.image);
  }
}
