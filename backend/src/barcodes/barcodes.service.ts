import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bwipjs from 'bwip-js';
import { Barcode, BarcodeType } from './barcode.entity';
import { CreateBarcodeDto } from './dto/create-barcode.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BarcodeService {
  constructor(
    @InjectRepository(Barcode)
    private barcodeRepo: Repository<Barcode>,
  ) {}

  async generateBarcode(dto: CreateBarcodeDto): Promise<Barcode> {
    const code = `${dto.type}-${dto.referenceId}-${Date.now()}`;

    // Generate barcode image
    const png = await bwipjs.toBuffer({
      bcid: dto.type === BarcodeType.QR ? 'qrcode' : 'code128',
      text: dto.referenceId,
      scale: 3,
      height: 10,
      includetext: true,
    });

    const imagePath = path.join(__dirname, `../../uploads/${dto.referenceId}.png`);
    fs.writeFileSync(imagePath, png);

    const barcode = this.barcodeRepo.create({
      ...dto,
      code,
      imagePath,
    });

    return this.barcodeRepo.save(barcode);
  }

  async findByReferenceId(referenceId: string): Promise<Barcode> {
    const barcode = await this.barcodeRepo.findOne({ where: { referenceId } });
    if (!barcode) throw new NotFoundException('Barcode not found');
    return barcode;
  }

  async regenerate(referenceId: string): Promise<Barcode> {
    const existing = await this.findByReferenceId(referenceId);
    return this.generateBarcode({ referenceId, type: existing.type });
  }
}