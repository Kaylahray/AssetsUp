import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetDisposal } from './entities/asset-disposal.entity';
import { CreateAssetDisposalDto } from './dto/create-asset-disposal.dto';
import { InventoryItem, InventoryStatus } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class AssetDisposalsService {
  constructor(
    @InjectRepository(AssetDisposal)
    private readonly disposalRepository: Repository<AssetDisposal>,
    @InjectRepository(InventoryItem)
    private readonly inventoryRepository: Repository<InventoryItem>,
  ) {}

  async markDisposed(dto: CreateAssetDisposalDto) {
    const asset = await this.inventoryRepository.findOne({ where: { id: dto.assetId } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${dto.assetId} not found`);
    }

    if (asset.status === InventoryStatus.DISPOSED) {
      throw new BadRequestException('Asset is already disposed');
    }

    return await this.inventoryRepository.manager.transaction(async (manager) => {
      const itemRepo = manager.getRepository(InventoryItem);
      const disposalRepo = manager.getRepository(AssetDisposal);

      asset.status = InventoryStatus.DISPOSED;
      await itemRepo.save(asset);

      const disposal = disposalRepo.create({
        assetId: dto.assetId,
        disposalDate: new Date(dto.disposalDate),
        method: dto.method,
        reason: dto.reason,
        approvedBy: dto.approvedBy,
      });
      const saved = await disposalRepo.save(disposal);

      return { message: 'Asset marked as disposed', disposal: saved };
    });
  }

  async findAll() {
    return this.disposalRepository.find({ order: { disposalDate: 'DESC' } });
  }

  async findByAsset(assetId: string) {
    return this.disposalRepository.find({ where: { assetId }, order: { disposalDate: 'DESC' } });
  }
}