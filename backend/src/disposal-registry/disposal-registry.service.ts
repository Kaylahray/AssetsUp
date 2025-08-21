import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisposalRecord } from './entities/disposal.entity';
import { CreateDisposalDto, DisposalFilterDto, UpdateDisposalDto } from './dto/disposal.dto';

@Injectable()
export class DisposalRegistryService {
  constructor(
    @InjectRepository(DisposalRecord)
    private readonly disposalRepository: Repository<DisposalRecord>,
  ) {}

  async create(createDisposalDto: CreateDisposalDto): Promise<DisposalRecord> {
    const disposal = this.disposalRepository.create(createDisposalDto);
    return await this.disposalRepository.save(disposal);
  }

  async findAll(filters: DisposalFilterDto): Promise<DisposalRecord[]> {
    const query = this.disposalRepository.createQueryBuilder('disposal')
      .where('disposal.isSoftDeleted = :isSoftDeleted', { isSoftDeleted: false });

    if (filters.disposalType) {
      query.andWhere('disposal.disposalType = :disposalType', { disposalType: filters.disposalType });
    }

    if (filters.startDate) {
      query.andWhere('disposal.disposalDate >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query.andWhere('disposal.disposalDate <= :endDate', { endDate: filters.endDate });
    }

    if (filters.responsibleUserId) {
      query.andWhere('disposal.responsibleUserId = :responsibleUserId', { 
        responsibleUserId: filters.responsibleUserId 
      });
    }

    if (filters.isProcessed !== undefined) {
      query.andWhere('disposal.isProcessed = :isProcessed', { isProcessed: filters.isProcessed });
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<DisposalRecord> {
    const disposal = await this.disposalRepository.findOne({ 
      where: { 
        id,
        isSoftDeleted: false 
      } 
    });

    if (!disposal) {
      throw new NotFoundException(`Disposal record with ID "${id}" not found`);
    }

    return disposal;
  }

  async update(id: string, updateDisposalDto: UpdateDisposalDto): Promise<DisposalRecord> {
    const disposal = await this.findOne(id);
    Object.assign(disposal, updateDisposalDto);
    return await this.disposalRepository.save(disposal);
  }

  async softDelete(id: string): Promise<void> {
    const disposal = await this.findOne(id);
    disposal.isSoftDeleted = true;
    await this.disposalRepository.save(disposal);
  }
}
