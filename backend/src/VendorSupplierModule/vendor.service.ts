import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vendor } from "./vendor.entity";
import { CreateVendorDto } from "./dto/create-vendor.dto";
import { UpdateVendorDto } from "./dto/update-vendor.dto";
import { VendorQueryDto } from "./dto/vendor-query.dto";
import { VendorStatus } from "./vendor.enums";

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    // Check if tax ID already exists
    const existingVendor = await this.vendorRepository.findOne({
      where: { taxId: createVendorDto.taxId },
    });

    if (existingVendor) {
      throw new ConflictException("Vendor with this tax ID already exists");
    }

    const vendor = this.vendorRepository.create({
      ...createVendorDto,
      status: createVendorDto.status || VendorStatus.ACTIVE,
    });

    return this.vendorRepository.save(vendor);
  }

  async findAll(
    query: VendorQueryDto
  ): Promise<{
    vendors: Vendor[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { type, status, page = 1, limit = 10 } = query;
    const queryBuilder = this.vendorRepository.createQueryBuilder("vendor");

    if (type) {
      queryBuilder.andWhere("vendor.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("vendor.status = :status", { status });
    }

    queryBuilder
      .orderBy("vendor.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    const [vendors, total] = await queryBuilder.getManyAndCount();

    return {
      vendors,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { id } });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${id} not found`);
    }

    return vendor;
  }

  async update(id: string, updateVendorDto: UpdateVendorDto): Promise<Vendor> {
    const vendor = await this.findOne(id);

    // Check if tax ID is being updated and already exists
    if (updateVendorDto.taxId && updateVendorDto.taxId !== vendor.taxId) {
      const existingVendor = await this.vendorRepository.findOne({
        where: { taxId: updateVendorDto.taxId },
      });

      if (existingVendor) {
        throw new ConflictException("Vendor with this tax ID already exists");
      }
    }

    Object.assign(vendor, updateVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const vendor = await this.findOne(id);
    await this.vendorRepository.remove(vendor);
  }

  async updateStatus(id: string, status: VendorStatus): Promise<Vendor> {
    const vendor = await this.findOne(id);
    vendor.status = status;
    return this.vendorRepository.save(vendor);
  }
}
