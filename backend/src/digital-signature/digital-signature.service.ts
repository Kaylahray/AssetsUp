import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DigitalSignature } from './entities/digital-signature.entity';
import { CreateSignatureDto } from './dto/create-signature.dto';

@Injectable()
export class DigitalSignatureService {
  constructor(
    @InjectRepository(DigitalSignature)
    private readonly signatureRepo: Repository<DigitalSignature>,
  ) {}

  async signDocument(dto: CreateSignatureDto): Promise<DigitalSignature> {
    const signature = this.signatureRepo.create(dto);
    return this.signatureRepo.save(signature);
  }

  async getSignaturesForDocument(documentId: string): Promise<DigitalSignature[]> {
    return this.signatureRepo.find({ where: { documentId } });
  }

  async verifySignature(documentId: string, userId: string): Promise<boolean> {
    const signature = await this.signatureRepo.findOne({ where: { documentId, userId } });
    return !!signature;
  }
}