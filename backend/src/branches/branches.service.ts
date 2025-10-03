import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(createDto: CreateBranchDto): Promise<Branch> {
    try {
      const branch = this.branchRepository.create(createDto);
      return await this.branchRepository.save(branch);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Branch with this name already exists in the company');
      }
      if (error.code === '23503') { // PostgreSQL foreign key violation error code
        throw new ConflictException('Company with the specified ID does not exist');
      }
      throw error;
    }
  }

  async findAll(): Promise<Branch[]> {
    return await this.branchRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCompany(companyId: number): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      relations: ['departments', 'assets'],
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ 
      where: { id },
      relations: ['departments', 'assets'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
    return branch;
  }

  async update(id: number, updateDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, updateDto);
    try {
      return await this.branchRepository.save(branch);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Branch with this name already exists in the company');
      }
      if (error.code === '23503') { // PostgreSQL foreign key violation error code
        throw new ConflictException('Company with the specified ID does not exist');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }

  async getBranchStats(id: number): Promise<{ departmentCount: number; assetCount: number }> {
    const branch = await this.findOne(id);
    
    return {
      departmentCount: branch.departments ? branch.departments.length : 0,
      assetCount: branch.assets ? branch.assets.length : 0,
    };
  }
}