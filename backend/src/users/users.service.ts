import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existing) throw new BadRequestException('Email already exists');
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });
    return this.userRepository.save(user);
  }

  async findAll(page = 1, limit = 10, role?: string): Promise<{ data: User[]; total: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      where: role ? { role: role as 'admin' | 'user' | 'manager' } : {},
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOneBy({ email: updateUserDto.email });
      if (existing) throw new BadRequestException('Email already exists');
    }
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }
  async mapUserToDepartment(id: string, department: any): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.department = department;
    return this.userRepository.save(user);
  }

  async mapUserToCompany(id: string, companyId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.companyId = companyId;
    return this.userRepository.save(user);
  }

  async mapUserToBranch(id: string, branchId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    user.branchId = branchId;
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
