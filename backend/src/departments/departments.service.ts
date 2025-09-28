import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import { CreateDepartmentDto } from './dto/department.dto';
import { UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const department = this.departmentRepository.create(createDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Department with this name already exists in the company');
      }
      if (error.code === '23503') { // PostgreSQL foreign key violation error code
        throw new ConflictException('Company with the specified ID does not exist');
      }
      throw error;
    }
  }

  async findAll(): Promise<Department[]> {
    return await this.departmentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByCompany(companyId: number): Promise<Department[]> {
    return await this.departmentRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    const department = await this.findOne(id);

    try {
      Object.assign(department, updateDepartmentDto);
      return await this.departmentRepository.save(department);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new ConflictException('Department with this name already exists in the company');
      }
      if (error.code === '23503') { // PostgreSQL foreign key violation error code
        throw new ConflictException('Company with the specified ID does not exist');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }

  async getDepartmentStats(id: number): Promise<{ userCount: number; assetCount: number }> {
    const department = await this.findOne(id);
    
    // These queries will be implemented when User and Asset entities are created
    // For now, returning placeholder values
    return {
      userCount: 0, // await this.userRepository.count({ where: { departmentId: id } })
      assetCount: 0, // await this.assetRepository.count({ where: { departmentId: id } })
    };
  }
}
