import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Branch, BranchStatus } from "./entities/branch.entity";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { FilterBranchDto } from "./dto/filter-branch.dto";

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>
  ) {}

  async create(dto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepo.create(dto);
    return this.branchRepo.save(branch);
  }

  async findAll(filters: FilterBranchDto): Promise<Branch[]> {
    const query = this.branchRepo.createQueryBuilder("branch");

    if (filters.status) {
      query.andWhere("branch.status = :status", { status: filters.status });
    }

    // Simple geolocation search (Haversine formula)
    if (filters.latitude && filters.longitude && filters.radiusKm) {
      query.andWhere(
        `
        earth_distance(
          ll_to_earth(branch.latitude, branch.longitude),
          ll_to_earth(:lat, :lng)
        ) <= :radiusMeters
      `,
        {
          lat: filters.latitude,
          lng: filters.longitude,
          radiusMeters: filters.radiusKm * 1000,
        }
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepo.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }

  async update(id: string, dto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, dto);
    return this.branchRepo.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepo.remove(branch);
  }
}
