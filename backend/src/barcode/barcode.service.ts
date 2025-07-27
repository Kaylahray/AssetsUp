import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barcode } from './barcode.entity';
import { GenerateBarcodeDto } from './dto/generate-barcode.dto';
import { generateBarcodeBuffer } from './barcode.util';

@Injectable()
export class BarcodeService {
  constructor(
    @InjectRepository(Barcode)
    private readonly barcodeRepository: Repository<Barcode>,
  ) {}

  async generateBarcode(dto: GenerateBarcodeDto): Promise<Barcode> {
    const { code, format } = dto;
    const image = await generateBarcodeBuffer(code, format);
    const barcode = this.barcodeRepository.create({ code, format, image });
    return this.barcodeRepository.save(barcode);
  }

  async getBarcode(id: string): Promise<Barcode> {
    const barcode = await this.barcodeRepository.findOne({ where: { id } });
    if (!barcode) throw new NotFoundException('Barcode not found');
    return barcode;
  }
}
