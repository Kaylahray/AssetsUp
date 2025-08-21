import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransferRequest } from './transfer-request.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateTransferRequestDto } from './dto/create-transfer-request.dto';
import { TransferStatus } from './enums/transfer-status.enum';
import { UpdateTransferRequestDto } from './dto/update-transfer-request.dto';
import { QueryTransferRequestDto } from './dto/query-transfer-request.dto';

@Injectable()
export class TransferService {
    constructor(
    @InjectRepository(TransferRequest)
    private readonly repo: Repository<TransferRequest>,
  ) {}

  async create(dto: CreateTransferRequestDto): Promise<TransferRequest> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? TransferStatus.Initiated,
      approvalDate:
        dto.status && [TransferStatus.Delivered, TransferStatus.InTransit].includes(dto.status)
          ? new Date()
          : null,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateTransferRequestDto): Promise<TransferRequest> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Transfer request not found');

    // Simple status transition validation (optional; extend as needed)
    if (dto.status) {
      if (existing.status === TransferStatus.Cancelled || existing.status === TransferStatus.Delivered) {
        throw new BadRequestException('Cannot update a completed/cancelled transfer');
      }
      existing.status = dto.status;
      existing.approvalDate =
        dto.status === TransferStatus.Delivered || dto.status === TransferStatus.InTransit
          ? new Date()
          : existing.approvalDate;
    }

    if (dto.toLocation) existing.toLocation = dto.toLocation;
    if (dto.fromLocation) existing.fromLocation = dto.fromLocation;
    if (dto.reason !== undefined) existing.reason = dto.reason;

    return this.repo.save(existing);
  }

  async findOne(id: string): Promise<TransferRequest> {
    const tr = await this.repo.findOne({ where: { id } });
    if (!tr) throw new NotFoundException('Transfer request not found');
    return tr;
  }

  async findMany(q: QueryTransferRequestDto): Promise<{ data: TransferRequest[]; total: number }> {
    const where: FindOptionsWhere<TransferRequest> = {};
    if (q.destination) where.toLocation = ILike(`%${q.destination}%`);
    if (q.requester) where.requestedBy = ILike(`%${q.requester}%`);
    if (q.status) where.status = q.status;

    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
