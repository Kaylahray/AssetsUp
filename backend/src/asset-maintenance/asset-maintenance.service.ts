import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { ScheduleMaintenanceDto } from './dto/schedule-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { InventoryItem, InventoryStatus } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class AssetMaintenanceService {
  constructor(
    @InjectRepository(AssetMaintenance)
    private readonly maintenanceRepository: Repository<AssetMaintenance>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async schedule(dto: ScheduleMaintenanceDto) {
    const asset = await this.inventoryRepository.findOne({ where: { id: dto.assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${dto.assetId} not found`);
    }

    // Prevent scheduling maintenance for disposed assets
    if (asset.status === InventoryStatus.DISPOSED) {
      throw new BadRequestException('Cannot schedule maintenance for disposed asset');
    }

    const record = this.maintenanceRepository.create({
      assetId: dto.assetId,
      scheduledDate: new Date(dto.scheduledDate),
      completedDate: null,
      maintenanceType: dto.maintenanceType,
      notes: dto.notes,
    });

    const saved = await this.maintenanceRepository.save(record);
    return { message: 'Maintenance scheduled', maintenance: saved };
  }

  async complete(id: string, dto: CompleteMaintenanceDto) {
    const record = await this.maintenanceRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    record.completedDate = new Date(dto.completedDate);
    if (dto.notes) {
      record.notes = dto.notes;
    }

    const saved = await this.maintenanceRepository.save(record);
    return { message: 'Maintenance completed', maintenance: saved };
  }

  async findAll() {
    return this.maintenanceRepository.find({ order: { scheduledDate: 'DESC' } });
  }

  async findByAsset(assetId: string) {
    return this.maintenanceRepository.find({ where: { assetId }, order: { scheduledDate: 'DESC' } });
  }
}