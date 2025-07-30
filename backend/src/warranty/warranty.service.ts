import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warranty } from './entities/warranty.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { UpdateWarrantyDto } from './dto/update-warranty.dto';

@Injectable()
export class WarrantyService {
  private readonly logger = new Logger(WarrantyService.name);

  constructor(
    @InjectRepository(Warranty)
    private readonly warrantyRepo: Repository<Warranty>,
  ) {}

  async create(dto: CreateWarrantyDto): Promise<Warranty> {
    const warranty = this.warrantyRepo.create(dto);
    const saved = await this.warrantyRepo.save(warranty);
    this.scheduleExpiryAlert(saved);
    return saved;
  }

  findAll(): Promise<Warranty[]> {
    return this.warrantyRepo.find();
  }

  async findOne(id: string): Promise<Warranty> {
    const found = await this.warrantyRepo.findOneBy({ id });
    if (!found) throw new NotFoundException('Warranty not found');
    return found;
  }

  async update(id: string, dto: UpdateWarrantyDto): Promise<Warranty> {
    await this.warrantyRepo.update(id, dto);
    const updated = await this.findOne(id);
    this.scheduleExpiryAlert(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.warrantyRepo.delete(id);
  }

  private scheduleExpiryAlert(warranty: Warranty) {
    const expiryTime = new Date(warranty.expiryDate).getTime() - Date.now();
    if (expiryTime <= 0) return;

    setTimeout(() => {
      this.logger.warn(
        `Warranty for ${warranty.assetName} is expiring on ${warranty.expiryDate}`,
      );
    }, Math.min(expiryTime, 86400000)); // for mock, only set timeout up to 1 day
  }
}
