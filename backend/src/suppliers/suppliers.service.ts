import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepo: Repository<Supplier>,
  ) {}

  create(dto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.suppliersRepo.create(dto);
    return this.suppliersRepo.save(supplier);
  }

  findAll(): Promise<Supplier[]> {
    return this.suppliersRepo.find({ relations: ['assets'] });
  }

  public async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepo.findOne({
      where: { id },
      relations: ['assets'],
    });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  public async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.suppliersRepo.save(supplier);
  }

  public async remove(id: string): Promise<void> {
    await this.suppliersRepo.delete(id);
  }
}
