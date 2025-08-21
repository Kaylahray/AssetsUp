import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto, VendorFilterDto } from './dto/vendor.dto';

@Injectable()
export class VendorDirectoryService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if vendor with same registration number exists
    const existingVendor = await this.vendorRepository.findOne({
      where: { 
        registrationNumber: createVendorDto.registrationNumber,
        isSoftDeleted: false
      },
    });

    if (existingVendor) {
      throw new ConflictException(
        `Vendor with registration number "${createVendorDto.registrationNumber}" already exists`,
      );
    }

    const vendor = this.vendorRepository.create(createVendorDto);
    return await this.vendorRepository.save(vendor);
  }

  async findAll(filters: VendorFilterDto): Promise<Vendor[]> {
    const query = this.vendorRepository.createQueryBuilder('vendor')
      .where('vendor.isSoftDeleted = :isSoftDeleted', { isSoftDeleted: false });

    if (filters.name) {
      query.andWhere('vendor.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.category) {
      query.andWhere('vendor.category = :category', { category: filters.category });
    }

    if (filters.region) {
      query.andWhere('vendor.region ILIKE :region', { region: `%${filters.region}%` });
    }

    if (filters.isActive !== undefined) {
      query.andWhere('vendor.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters.registrationNumber) {
      query.andWhere('vendor.registrationNumber = :registrationNumber', { 
        registrationNumber: filters.registrationNumber 
      });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: {
        id,
        isSoftDeleted: false,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID "${id}" not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);
    Object.assign(vendor, updateVendorDto);
    return await this.vendorRepository.save(vendor);
  }

  async softDelete(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    vendor.isSoftDeleted = true;
    await this.vendorRepository.save(vendor);
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Vendor | null> {
    return await this.vendorRepository.findOne({
      where: {
        registrationNumber,
        isSoftDeleted: false,
      },
    });
  }
}
