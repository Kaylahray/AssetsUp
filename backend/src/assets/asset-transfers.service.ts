import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { AssetTransfer, TransferStatus, TransferType } from "./entities/asset-transfer.entity"
import { Asset, AssetStatus } from "./entities/asset.entity"
import { User } from "../users/entities/user.entity"
import type { CreateAssetTransferDto } from "./dto/create-asset-transfer.dto"
import type { UpdateAssetTransferDto } from "./dto/update-asset-transfer.dto"
import type { StarknetService } from "../starknet/starknet.service"
import type { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class AssetTransfersService {
  private assetTransfersRepository: Repository<AssetTransfer>
  private assetsRepository: Repository<Asset>
  private usersRepository: Repository<User>

  constructor(
    @InjectRepository(AssetTransfer)
    assetTransfersRepository: Repository<AssetTransfer>,
    @InjectRepository(Asset)
    assetsRepository: Repository<Asset>,
    @InjectRepository(User)
    usersRepository: Repository<User>,
    private starknetService: StarknetService,
    private notificationsService: NotificationsService,
  ) {
    this.assetTransfersRepository = assetTransfersRepository
    this.assetsRepository = assetsRepository
    this.usersRepository = usersRepository
  }

  async findAll(filters?: {
    assetId?: string
    userId?: string
    department?: string
    status?: TransferStatus
  }): Promise<AssetTransfer[]> {
    const query = this.assetTransfersRepository
      .createQueryBuilder("transfer")
      .leftJoinAndSelect("transfer.asset", "asset")
      .leftJoinAndSelect("transfer.fromUser", "fromUser")
      .leftJoinAndSelect("transfer.toUser", "toUser")
      .leftJoinAndSelect("transfer.requestedBy", "requestedBy")
      .leftJoinAndSelect("transfer.approvedBy", "approvedBy")

    if (filters) {
      if (filters.assetId) {
        query.andWhere("transfer.assetId = :assetId", { assetId: filters.assetId })
      }

      if (filters.userId) {
        query.andWhere("(transfer.fromUserId = :userId OR transfer.toUserId = :userId)", { userId: filters.userId })
      }

      if (filters.department) {
        query.andWhere("(transfer.fromDepartment = :department OR transfer.toDepartment = :department)", {
          department: filters.department,
        })
      }

      if (filters.status) {
        query.andWhere("transfer.status = :status", { status: filters.status })
      }
    }

    return query.orderBy("transfer.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<AssetTransfer> {
    const transfer = await this.assetTransfersRepository.findOne({
      where: { id },
      relations: ["asset", "fromUser", "toUser", "requestedBy", "approvedBy"],
    })

    if (!transfer) {
      throw new NotFoundException(`Asset transfer with ID ${id} not found`)
    }

    return transfer
  }

  async create(createAssetTransferDto: CreateAssetTransferDto, requestedById: string): Promise<AssetTransfer> {
    // Validate asset exists
    const asset = await this.assetsRepository.findOne({
      where: { id: createAssetTransferDto.assetId },
      relations: ["assignedTo"],
    })

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${createAssetTransferDto.assetId} not found`)
    }

    // Validate users if provided
    if (createAssetTransferDto.fromUserId) {
      const fromUser = await this.usersRepository.findOne({ where: { id: createAssetTransferDto.fromUserId } })
      if (!fromUser) {
        throw new NotFoundException(`User with ID ${createAssetTransferDto.fromUserId} not found`)
      }
    }

    if (createAssetTransferDto.toUserId) {
      const toUser = await this.usersRepository.findOne({ where: { id: createAssetTransferDto.toUserId } })
      if (!toUser) {
        throw new NotFoundException(`User with ID ${createAssetTransferDto.toUserId} not found`)
      }
    }

    // Create transfer record
    const transfer = this.assetTransfersRepository.create({
      ...createAssetTransferDto,
      requestedById,
      status: TransferStatus.PENDING,
    })

    const savedTransfer = await this.assetTransfersRepository.save(transfer)

    // Send notifications
    if (createAssetTransferDto.toUserId) {
      await this.notificationsService.createNotification({
        userId: createAssetTransferDto.toUserId,
        title: "New Asset Assignment",
        message: `You have been assigned asset ${asset.name} (${asset.assetTag})`,
        type: "asset_assignment",
        referenceId: savedTransfer.id,
      })
    }

    // Notify asset managers about the pending transfer
    const assetManagers = await this.usersRepository.find({
      where: { role: "asset_manager" },
    })

    for (const manager of assetManagers) {
      await this.notificationsService.createNotification({
        userId: manager.id,
        title: "Asset Transfer Request",
        message: `New asset transfer request for ${asset.name} (${asset.assetTag})`,
        type: "asset_transfer_request",
        referenceId: savedTransfer.id,
      })
    }

    return savedTransfer
  }

  async update(id: string, updateAssetTransferDto: UpdateAssetTransferDto, userId: string): Promise<AssetTransfer> {
    const transfer = await this.findOne(id)

    // If status is being updated to approved or rejected, set the approvedBy
    if (
      updateAssetTransferDto.status === TransferStatus.APPROVED ||
      updateAssetTransferDto.status === TransferStatus.REJECTED
    ) {
      updateAssetTransferDto.approvedById = userId
    }

    // If approving the transfer, update the asset assignment
    if (updateAssetTransferDto.status === TransferStatus.APPROVED) {
      const asset = await this.assetsRepository.findOne({
        where: { id: transfer.assetId },
        relations: ["assignedTo"],
      })

      if (!asset) {
        throw new NotFoundException(`Asset with ID ${transfer.assetId} not found`)
      }

      // Update asset based on transfer type
      switch (transfer.transferType) {
        case TransferType.USER_TO_USER:
        case TransferType.DEPARTMENT_TO_USER:
        case TransferType.INITIAL_ASSIGNMENT:
          if (transfer.toUserId) {
            asset.assignedToId = transfer.toUserId
            asset.status = AssetStatus.ASSIGNED
            asset.department = transfer.toDepartment || asset.department
          }
          break
        case TransferType.USER_TO_DEPARTMENT:
        case TransferType.DEPARTMENT_TO_DEPARTMENT:
          asset.assignedToId = null
          asset.status = AssetStatus.AVAILABLE
          asset.department = transfer.toDepartment || asset.department
          break
      }

      await this.assetsRepository.save(asset)

      // Record on blockchain
      try {
        const onChainId = await this.starknetService.transferAssetOwnership(
          asset,
          transfer.toUserId || transfer.toDepartment,
        )
        transfer.onChainId = onChainId
        transfer.status = TransferStatus.COMPLETED
      } catch (error) {
        console.error("Failed to record transfer on StarkNet:", error)
        // Continue with the transfer even if blockchain recording fails
        transfer.status = TransferStatus.COMPLETED
      }

      // Send notification to the recipient
      if (transfer.toUserId) {
        await this.notificationsService.createNotification({
          userId: transfer.toUserId,
          title: "Asset Transfer Approved",
          message: `The transfer of asset ${asset.name} (${asset.assetTag}) to you has been approved`,
          type: "asset_transfer_approved",
          referenceId: transfer.id,
        })
      }
    } else if (updateAssetTransferDto.status === TransferStatus.REJECTED) {
      // Send notification to the requester
      if (transfer.requestedById) {
        await this.notificationsService.createNotification({
          userId: transfer.requestedById,
          title: "Asset Transfer Rejected",
          message: `Your request to transfer asset has been rejected`,
          type: "asset_transfer_rejected",
          referenceId: transfer.id,
        })
      }
    }

    Object.assign(transfer, updateAssetTransferDto)
    return this.assetTransfersRepository.save(transfer)
  }

  async remove(id: string): Promise<void> {
    const transfer = await this.findOne(id)

    if (transfer.status === TransferStatus.COMPLETED) {
      throw new BadRequestException("Cannot delete a completed transfer")
    }

    await this.assetTransfersRepository.remove(transfer)
  }

  async getAssetTransferHistory(assetId: string): Promise<AssetTransfer[]> {
    return this.assetTransfersRepository.find({
      where: { assetId },
      relations: ["fromUser", "toUser", "requestedBy", "approvedBy"],
      order: { transferDate: "DESC" },
    })
  }

  async getUserTransferHistory(userId: string): Promise<AssetTransfer[]> {
    return this.assetTransfersRepository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      relations: ["asset", "fromUser", "toUser", "requestedBy", "approvedBy"],
      order: { transferDate: "DESC" },
    })
  }

  async getDepartmentTransferHistory(department: string): Promise<AssetTransfer[]> {
    return this.assetTransfersRepository.find({
      where: [{ fromDepartment: department }, { toDepartment: department }],
      relations: ["asset", "fromUser", "toUser", "requestedBy", "approvedBy"],
      order: { transferDate: "DESC" },
    })
  }

  async getPendingTransfers(): Promise<AssetTransfer[]> {
    return this.assetTransfersRepository.find({
      where: { status: TransferStatus.PENDING },
      relations: ["asset", "fromUser", "toUser", "requestedBy"],
      order: { createdAt: "ASC" },
    })
  }

  async getTransfersByStatus(status: TransferStatus): Promise<AssetTransfer[]> {
    return this.assetTransfersRepository.find({
      where: { status },
      relations: ["asset", "fromUser", "toUser", "requestedBy", "approvedBy"],
      order: { updatedAt: "DESC" },
    })
  }
}
