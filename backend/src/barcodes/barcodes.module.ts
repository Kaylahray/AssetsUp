import { Module } from '@nestjs/common';
import { Barcode } from './barcode.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarcodeService } from './barcodes.service';
import { BarcodeController } from './barcodes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Barcode])],
  providers: [BarcodeService],
  controllers: [BarcodeController]
})
export class BarcodesModule {}
