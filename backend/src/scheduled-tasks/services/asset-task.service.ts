import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, LessThan } from "typeorm"
import { Asset, AssetStatus } from "../entities/asset.entity"
import type { NotificationService } from "./notification.service"

@Injectable()
export class AssetTaskService {
  private readonly logger = new Logger(AssetTaskService.name);

  constructor(
    private readonly notificationService: NotificationService,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async detectOverdueAssets(configuration: any = {}): Promise<any> {
    const { includeStatuses = [AssetStatus.ACTIVE], notifyUsers = [], gracePeriodDays = 0 } = configuration

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays)

    const overdueAssets = await this.assetRepository.find({
      where: {
        status: includeStatuses.length > 0 ? includeStatuses[0] : AssetStatus.ACTIVE,
        dueDate: LessThan(cutoffDate),
      },
    })

    this.logger.log(`Found ${overdueAssets.length} overdue assets`)

    if (overdueAssets.length > 0) {
      // Send notifications
      for (const user of notifyUsers) {
        await this.notificationService.sendOverdueAssetNotification(user, overdueAssets)
      }

      // Update asset metadata to track overdue status
      for (const asset of overdueAssets) {
        asset.metadata = {
          ...asset.metadata,
          overdueDetectedAt: new Date(),
          daysPastDue: Math.floor((new Date().getTime() - asset.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
        }
        await this.assetRepository.save(asset)
      }
    }

    return {
      overdueAssetsCount: overdueAssets.length,
      overdueAssets: overdueAssets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        assetCode: asset.assetCode,
        dueDate: asset.dueDate,
        daysPastDue: Math.floor((new Date().getTime() - asset.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      notificationsSent: notifyUsers.length,
    }
  }

  async getOverdueAssets(): Promise<Asset[]> {
    return this.assetRepository.find({
      where: {
        dueDate: LessThan(new Date()),
        status: AssetStatus.ACTIVE,
      },
      order: { dueDate: "ASC" },
    })
  }

  async markAssetAsOverdue(assetId: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id: assetId } })

    if (asset) {
      asset.metadata = {
        ...asset.metadata,
        isOverdue: true,
        overdueMarkedAt: new Date(),
      }
      return this.assetRepository.save(asset)
    }

    return null
  }
}
