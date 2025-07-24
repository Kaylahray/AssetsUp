import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {}

  async create(dto: CreateRoleDto) {
    const role = this.roleRepo.create({ name: dto.name });

    if (dto.permissionIds?.length) {
      const perms = await this.permissionRepo.findByIds(dto.permissionIds);
      role.permissions = perms;
    }

    return this.roleRepo.save(role);
  }

  async findAll() {
    return this.roleRepo.find({ relations: ['permissions'] });
  }

  async findPermissions(roleId: string) {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) throw new NotFoundException('Role not found');
    return role.permissions;
  }
}