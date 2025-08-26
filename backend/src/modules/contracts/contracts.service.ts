import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractStatus } from './enums/contract-status.enum';

@Injectable()
export class ContractsService {
  constructor(@InjectRepository(Contract) private readonly repo: Repository<Contract>) {}

  private computeStatus(start: Date, end: Date, explicit?: ContractStatus): ContractStatus {
    if (explicit === ContractStatus.TERMINATED) return ContractStatus.TERMINATED;
    const now = new Date();
    if (end.getTime() < now.getTime()) return ContractStatus.EXPIRED;
    if (start.getTime() > now.getTime()) return ContractStatus.PENDING;
    return ContractStatus.ACTIVE;
  }

  private async ensureNoOverlap(vendorId: string, start: Date, end: Date, excludeId?: string) {
    if (end.getTime() < start.getTime()) {
      throw new BadRequestException('endDate must be >= startDate');
    }
    // Find contracts for same vendor that overlap [start, end] and are not TERMINATED
    const qb = this.repo.createQueryBuilder('c')
      .where('c.vendorId = :vendorId', { vendorId })
      .andWhere('c.status != :terminated', { terminated: ContractStatus.TERMINATED })
      .andWhere('NOT (c.endDate < :start OR c.startDate > :end)', { start, end });
    if (excludeId) qb.andWhere('c.id != :excludeId', { excludeId });
    const overlap = await qb.getOne();
    if (overlap) throw new ConflictException('Overlapping contract exists for this vendor');
  }

  async create(dto: CreateContractDto): Promise<Contract> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new BadRequestException('Invalid date(s)');

    await this.ensureNoOverlap(dto.vendorId, start, end);

    const exists = await this.repo.findOne({ where: { contractId: dto.contractId } });
    if (exists) throw new ConflictException('contractId already exists');

    const entity = this.repo.create({
      contractId: dto.contractId,
      vendorId: dto.vendorId,
      title: dto.title,
      terms: dto.terms,
      startDate: start,
      endDate: end,
      documentUrl: dto.documentUrl ?? null,
      status: this.computeStatus(start, end, dto.status),
    });
    return this.repo.save(entity);
  }

  async findAll(filter?: { vendorId?: string; status?: ContractStatus; active?: boolean; expired?: boolean }): Promise<Contract[]> {
    const qb = this.repo.createQueryBuilder('c').orderBy('c.endDate', 'ASC');
    if (filter?.vendorId) qb.andWhere('c.vendorId = :vendorId', { vendorId: filter.vendorId });
    if (filter?.status) qb.andWhere('c.status = :status', { status: filter.status });

    // Derived filters
    const now = new Date();
    if (filter?.active) qb.andWhere('c.startDate <= :now AND c.endDate >= :now AND c.status = :active', { now, active: ContractStatus.ACTIVE });
    if (filter?.expired) qb.andWhere('c.endDate < :now AND c.status = :expired', { now, expired: ContractStatus.EXPIRED });

    const rows = await qb.getMany();

    // Refresh statuses if drifted (optional consistency)
    for (const r of rows) {
      const computed = this.computeStatus(new Date(r.startDate), new Date(r.endDate), r.status);
      if (computed !== r.status) {
        r.status = computed;
        await this.repo.save(r);
      }
    }
    return rows;
  }

  async findOne(id: string): Promise<Contract> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Contract not found');
    const computed = this.computeStatus(new Date(c.startDate), new Date(c.endDate), c.status);
    if (computed !== c.status) {
      c.status = computed;
      await this.repo.save(c);
    }
    return c;
  }

  async update(id: string, dto: UpdateContractDto): Promise<Contract> {
    const c = await this.findOne(id);

    const start = dto.startDate ? new Date(dto.startDate) : new Date(c.startDate);
    const end = dto.endDate ? new Date(dto.endDate) : new Date(c.endDate);
    if (dto.startDate && isNaN(start.getTime())) throw new BadRequestException('Invalid startDate');
    if (dto.endDate && isNaN(end.getTime())) throw new BadRequestException('Invalid endDate');

    // If vendorId changes or dates change, re-check overlap
    const vendorToCheck = dto.vendorId ?? c.vendorId;
    if (dto.vendorId || dto.startDate || dto.endDate) {
      await this.ensureNoOverlap(vendorToCheck, start, end, c.id);
    }

    if (dto.contractId && dto.contractId !== c.contractId) {
      const exists = await this.repo.findOne({ where: { contractId: dto.contractId } });
      if (exists) throw new ConflictException('contractId already exists');
    }

    Object.assign(c, {
      contractId: dto.contractId ?? c.contractId,
      vendorId: vendorToCheck,
      title: dto.title ?? c.title,
      terms: dto.terms ?? c.terms,
      startDate: start,
      endDate: end,
      documentUrl: dto.documentUrl ?? c.documentUrl,
    });

    c.status = this.computeStatus(start, end, dto.status ?? c.status);

    return this.repo.save(c);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  /** Attach/replace a document URL (after upload) */
  async attachDocument(id: string, url: string): Promise<Contract> {
    const c = await this.findOne(id);
    c.documentUrl = url;
    return this.repo.save(c);
  }
}