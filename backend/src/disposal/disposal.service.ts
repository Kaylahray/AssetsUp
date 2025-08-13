import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import { DisposalRecord } from "./disposal-record.entity";
import { CreateDisposalRecordDto } from "./dto/create-disposal-record.dto";
import { UpdateDisposalRecordDto } from "./dto/update-disposal-record.dto";
import { getMockAcquisitionDate } from "./utils/acquisition-date.util";

@Injectable()
export class DisposalService {
  constructor(
    @InjectRepository(DisposalRecord)
    private readonly repo: Repository<DisposalRecord>
  ) {}

  async create(dto: CreateDisposalRecordDto): Promise<DisposalRecord> {
    this.validateDisposalDate(dto.assetId, dto.disposalDate);
    const entity = this.repo.create({
      ...dto,
      finalValue: dto.finalValue.toFixed(2), // store as string for numeric column
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<DisposalRecord[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<DisposalRecord> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException("Disposal record not found");
    return rec;
  }

  async update(
    id: string,
    dto: UpdateDisposalRecordDto
  ): Promise<DisposalRecord> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException("Disposal record not found");

    const assetId = dto.assetId ?? rec.assetId;
    const disposalDate = dto.disposalDate ?? rec.disposalDate;

    this.validateDisposalDate(assetId, disposalDate);

    if (dto.finalValue !== undefined) {
      (dto as any).finalValue = dto.finalValue.toFixed(2);
    }

    Object.assign(rec, dto);
    return this.repo.save(rec);
  }

  async softDelete(id: string): Promise<void> {
    const res = await this.repo.softDelete({
      id,
    } as FindOptionsWhere<DisposalRecord>);
    if (!res.affected) throw new NotFoundException("Disposal record not found");
  }

  async restore(id: string): Promise<void> {
    const res = await this.repo.restore({
      id,
    } as FindOptionsWhere<DisposalRecord>);
    if (!res.affected) throw new NotFoundException("Disposal record not found");
  }

  async removePermanently(id: string): Promise<void> {
    const res = await this.repo.delete({
      id,
    } as FindOptionsWhere<DisposalRecord>);
    if (!res.affected) throw new NotFoundException("Disposal record not found");
  }

  private validateDisposalDate(assetId: string, disposalDateISO: string) {
    const acq = getMockAcquisitionDate(assetId); // YYYY-MM-DD
    if (new Date(disposalDateISO) < new Date(acq)) {
      throw new BadRequestException(
        `Disposal date (${disposalDateISO}) cannot be before mock acquisition date (${acq})`
      );
    }
  }
}
