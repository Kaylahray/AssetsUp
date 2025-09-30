import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetTransfer } from './entities/asset-transfer.entity';
import { InitiateTransferDto } from './dto/initiate-transfer.dto';
import { InventoryItem } from '../../inventory-items/entities/inventory-item.entity';

@Injectable()
export class AssetTransfersService {
  constructor(
    @InjectRepository(AssetTransfer)
    private readonly transferRepository: Repository<AssetTransfer>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async initiateTransfer(dto: InitiateTransferDto): Promise<AssetTransfer> {
    const asset = await this.inventoryRepository.findOne({ where: { id: dto.assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset ${dto.assetId} not found`);
    }

    // Update asset ownership (department)
    (asset as any).currentDepartmentId = dto.toDepartmentId;
    await this.inventoryRepository.save(asset);

    const transfer = this.transferRepository.create({
      assetId: dto.assetId,
      fromDepartmentId: dto.fromDepartmentId ?? (asset as any).currentDepartmentId ?? null,
      toDepartmentId: dto.toDepartmentId,
      transferDate: new Date(),
      initiatedBy: dto.initiatedBy,
      reason: dto.reason,
    });
    return await this.transferRepository.save(transfer);
  }
}


