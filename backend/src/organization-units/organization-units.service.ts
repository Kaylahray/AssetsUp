import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationUnit } from './entities/organization-unit.entity';
import { CreateOrganizationUnitDto } from './dto/create-organization-unit.dto';
import { UpdateOrganizationUnitDto } from './dto/update-organization-unit.dto';

@Injectable()
export class OrganizationUnitsService {
  constructor(
    @InjectRepository(OrganizationUnit)
    private readonly orgUnitRepo: Repository<OrganizationUnit>,
  ) {}

  async create(dto: CreateOrganizationUnitDto): Promise<OrganizationUnit> {
    const unit = this.orgUnitRepo.create(dto);
    return this.orgUnitRepo.save(unit);
  }

  async findAll(): Promise<OrganizationUnit[]> {
    return this.orgUnitRepo.find();
  }

  async findOne(id: string): Promise<OrganizationUnit> {
    const unit = await this.orgUnitRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`OrganizationUnit ${id} not found`);
    return unit;
  }

  async update(id: string, dto: UpdateOrganizationUnitDto): Promise<OrganizationUnit> {
    const unit = await this.findOne(id);
    Object.assign(unit, dto);
    return this.orgUnitRepo.save(unit);
  }

  async remove(id: string): Promise<void> {
    const unit = await this.findOne(id);
    await this.orgUnitRepo.remove(unit);
  }

  async getTree(): Promise<any[]> {
    const units = await this.orgUnitRepo.find();
    const map = new Map<string, any>();
    const roots: any[] = [];
    units.forEach(unit => {
      map.set(unit.id, { ...unit, children: [] });
    });
    map.forEach(unit => {
      if (unit.parentId && map.has(unit.parentId)) {
        map.get(unit.parentId).children.push(unit);
      } else {
        roots.push(unit);
      }
    });
    return roots;
  }
} 