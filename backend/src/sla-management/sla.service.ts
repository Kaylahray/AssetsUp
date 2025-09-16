import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SLARecord } from './entities/sla-record.entity';
import { SLABreach } from './entities/sla-breach.entity';
import { CreateSLARecordDto } from './dto/create-sla-record.dto';
import { UpdateSLARecordDto } from './dto/update-sla-record.dto';
import { CreateSLABreachDto } from './dto/create-sla-breach.dto';
import { SLAQueryDto } from './dto/sla-query.dto';
import { SLAStatus } from './sla.enums';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SLAService {
  constructor(
    @InjectRepository(SLARecord)
    private slaRecordRepository: Repository<SLARecord>,
    @InjectRepository(SLABreach)
    private slaBreachRepository: Repository<SLABreach>,
  ) {}

  async create(createSLARecordDto: CreateSLARecordDto): Promise<SLARecord> {
    // Validate dates
    const startDate = new Date(createSLARecordDto.coverageStart);
    const endDate = new Date(createSLARecordDto.coverageEnd);

    if (startDate >= endDate) {
      throw new BadRequestException('Coverage start date must be before end date');
    }

    const slaRecord = this.slaRecordRepository.create({
      ...createSLARecordDto,
      coverageStart: startDate,
      coverageEnd: endDate,
    });

    return await this.slaRecordRepository.save(slaRecord);
  }

  async findAll(queryDto: SLAQueryDto): Promise<{ data: SLARecord[]; total: number; page: number; limit: number }> {
    const queryBuilder = this.createQueryBuilder(queryDto);
    
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((queryDto.page - 1) * queryDto.limit)
      .take(queryDto.limit)
      .getMany();

    return {
      data,
      total,
      page: queryDto.page,
      limit: queryDto.limit,
    };
  }

  async findOne(id: string): Promise<SLARecord> {
    const slaRecord = await this.slaRecordRepository.findOne({
      where: { id },
      relations: ['vendor', 'breaches'],
    });

    if (!slaRecord) {
      throw new NotFoundException(`SLA Record with ID ${id} not found`);
    }

    return slaRecord;
  }

  async update(id: string, updateSLARecordDto: UpdateSLARecordDto): Promise<SLARecord> {
    const slaRecord = await this.findOne(id);

    // Validate dates if provided
    if (updateSLARecordDto.coverageStart || updateSLARecordDto.coverageEnd) {
      const startDate = updateSLARecordDto.coverageStart 
        ? new Date(updateSLARecordDto.coverageStart)
        : slaRecord.coverageStart;
      const endDate = updateSLARecordDto.coverageEnd
        ? new Date(updateSLARecordDto.coverageEnd)
        : slaRecord.coverageEnd;

      if (startDate >= endDate) {
        throw new BadRequestException('Coverage start date must be before end date');
      }
    }

    const updateData = { ...updateSLARecordDto };
    if (updateSLARecordDto.coverageStart) {
      updateData.coverageStart = new Date(updateSLARecordDto.coverageStart);
    }
    if (updateSLARecordDto.coverageEnd) {
      updateData.coverageEnd = new Date(updateSLARecordDto.coverageEnd);
    }

    await this.slaRecordRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const slaRecord = await this.findOne(id);
    await this.slaRecordRepository.remove(slaRecord);
  }

  async findByVendor(vendorId: string): Promise<SLARecord[]> {
    return await this.slaRecordRepository.find({
      where: { vendorId },
      relations: ['vendor', 'breaches'],
    });
  }

  async findExpiring(days: number = 30): Promise<SLARecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.slaRecordRepository
      .createQueryBuilder('sla')
      .leftJoinAndSelect('sla.vendor', 'vendor')
      .where('sla.coverageEnd <= :futureDate', { futureDate })
      .andWhere('sla.coverageEnd > :now', { now: new Date() })
      .andWhere('sla.status = :status', { status: SLAStatus.ACTIVE })
      .getMany();
  }

  async findExpired(): Promise<SLARecord[]> {
    return await this.slaRecordRepository
      .createQueryBuilder('sla')
      .leftJoinAndSelect('sla.vendor', 'vendor')
      .where('sla.coverageEnd < :now', { now: new Date() })
      .andWhere('sla.status != :status', { status: SLAStatus.EXPIRED })
      .getMany();
  }

  // SLA Breach Management
  async createBreach(createSLABreachDto: CreateSLABreachDto): Promise<SLABreach> {
    const slaRecord = await this.findOne(createSLABreachDto.slaRecordId);
    
    const breach = this.slaBreachRepository.create({
      ...createSLABreachDto,
      breachTime: new Date(createSLABreachDto.breachTime),
      resolvedTime: createSLABreachDto.resolvedTime ? new Date(createSLABreachDto.resolvedTime) : null,
      isResolved: !!createSLABreachDto.resolvedTime,
    });

    if (breach.resolvedTime && breach.breachTime) {
      breach.resolutionTimeHours = Math.ceil(
        (breach.resolvedTime.getTime() - breach.breachTime.getTime()) / (1000 * 60 * 60)
      );
    }

    return await this.slaBreachRepository.save(breach);
  }

  async findBreachesBySLA(slaRecordId: string): Promise<SLABreach[]> {
    return await this.slaBreachRepository.find({
      where: { slaRecordId },
      relations: ['slaRecord'],
      order: { breachTime: 'DESC' },
    });
  }

  async resolveBreach(breachId: string, resolutionNotes?: string): Promise<SLABreach> {
    const breach = await this.slaBreachRepository.findOne({
      where: { id: breachId },
    });

    if (!breach) {
      throw new NotFoundException(`SLA Breach with ID ${breachId} not found`);
    }

    const resolvedTime = new Date();
    const resolutionTimeHours = Math.ceil(
      (resolvedTime.getTime() - breach.breachTime.getTime()) / (1000 * 60 * 60)
    );

    await this.slaBreachRepository.update(breachId, {
      isResolved: true,
      resolvedTime,
      resolutionTimeHours,
      resolutionNotes,
    });

    return await this.slaBreachRepository.findOne({
      where: { id: breachId },
      relations: ['slaRecord'],
    });
  }

  // Automated SLA monitoring
  @Cron(CronExpression.EVERY_HOUR)
  async checkForExpiredSLAs(): Promise<void> {
    const expiredSLAs = await this.findExpired();
    
    for (const sla of expiredSLAs) {
      await this.slaRecordRepository.update(sla.id, {
        status: SLAStatus.EXPIRED,
      });
    }

    if (expiredSLAs.length > 0) {
      console.log(`Updated ${expiredSLAs.length} expired SLAs`);
    }
  }

  // Mock SLA breach trigger - simulates breach detection
  async mockBreachTrigger(slaRecordId: string, description: string): Promise<SLABreach> {
    const slaRecord = await this.findOne(slaRecordId);
    
    // Simulate different breach scenarios based on SLA type
    const mockBreachDto: CreateSLABreachDto = {
      slaRecordId,
      description: description || 'Automated breach detection: Response time exceeded',
      severity: this.determineMockSeverity(slaRecord),
      breachTime: new Date().toISOString(),
    };

    return await this.createBreach(mockBreachDto);
  }

  private determineMockSeverity(slaRecord: SLARecord) {
    // Mock logic to determine severity based on SLA priority and type
    switch (slaRecord.priority) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'major';
      default:
        return 'minor';
    }
  }

  private createQueryBuilder(queryDto: SLAQueryDto): SelectQueryBuilder<SLARecord> {
    const queryBuilder = this.slaRecordRepository
      .createQueryBuilder('sla')
      .leftJoinAndSelect('sla.vendor', 'vendor')
      .leftJoinAndSelect('sla.breaches', 'breaches');

    if (queryDto.vendorId) {
      queryBuilder.andWhere('sla.vendorId = :vendorId', { vendorId: queryDto.vendorId });
    }

    if (queryDto.assetCategory) {
      queryBuilder.andWhere('sla.assetCategory = :assetCategory', { assetCategory: queryDto.assetCategory });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('sla.status = :status', { status: queryDto.status });
    }

    if (queryDto.priority) {
      queryBuilder.andWhere('sla.priority = :priority', { priority: queryDto.priority });
    }

    if (queryDto.expiringBefore) {
      queryBuilder.andWhere('sla.coverageEnd <= :expiringBefore', { 
        expiringBefore: new Date(queryDto.expiringBefore) 
      });
    }

    if (queryDto.coverageStartAfter) {
      queryBuilder.andWhere('sla.coverageStart >= :coverageStartAfter', { 
        coverageStartAfter: new Date(queryDto.coverageStartAfter) 
      });
    }

    if (queryDto.coverageEndBefore) {
      queryBuilder.andWhere('sla.coverageEnd <= :coverageEndBefore', { 
        coverageEndBefore: new Date(queryDto.coverageEndBefore) 
      });
    }

    if (queryDto.expired) {
      queryBuilder.andWhere('sla.coverageEnd < :now', { now: new Date() });
    }

    if (queryDto.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      queryBuilder.andWhere('sla.coverageEnd <= :thirtyDaysFromNow', { thirtyDaysFromNow })
                  .andWhere('sla.coverageEnd > :now', { now: new Date() });
    }

    queryBuilder.orderBy(`sla.${queryDto.sortBy}`, queryDto.sortOrder);

    return queryBuilder;
  }
}
