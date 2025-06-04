import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, Like, type FindOptionsWhere } from "typeorm"
import { Asset, AssetStatus } from "./entities/asset.entity"
import type { CreateAssetDto } from "./dto/create-asset.dto"
import type { UpdateAssetDto } from "./dto/update-asset.dto"
import type { StarknetService } from "../starknet/starknet.service"
import type { AssetTransfersService } from "./asset-transfers.service"
import { TransferType } from "./entities/asset-transfer.entity"
import type { NotificationsService } from "../notifications/notifications.service"
import * as QRCode from "qrcode"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
    private starknetService: StarknetService,
    private assetTransfersService: AssetTransfersService,
    private notificationsService: NotificationsService
  ) {}

  async findAll(filters?: {
    category?: string
    department?: string
    status?: string
    search?: string
    assignedToId?: string
    branchId?: string
  }): Promise<Asset[]> {
    const where: FindOptionsWhere<Asset> = {}

    if (filters) {
      if (filters.category) {
        where.category = filters.category
      }

      if (filters.department) {
        where.department = filters.department
      }

      if (filters.status) {
        where.status = filters.status as AssetStatus
      }

      if (filters.search) {
        where.name = Like(`%${filters.search}%`)
      }

      if (filters.assignedToId) {
        where.assignedToId = filters.assignedToId
      }

      if (filters.branchId) {
        where.branchId = filters.branchId
      }
    }

    return this.assetsRepository.find({
      where,
      relations: ["assignedTo", "branch"],
    })
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetsRepository.findOne({
      where: { id },
      relations: ["assignedTo", "maintenanceRecords", "transfers", "branch"],
    })

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`)
    }

    return asset
  }

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    // Check if serial number is unique
    const existingAsset = await this.assetsRepository.findOne({
      where: { serialNumber: createAssetDto.serialNumber },
    })

    if (existingAsset) {
      throw new BadRequestException(`Asset with serial number ${createAssetDto.serialNumber} already exists`)
    }

    // Generate asset tag if not provided
    if (!createAssetDto.assetTag) {
      const count = await this.assetsRepository.count()
      createAssetDto.assetTag = `ASSET-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`
    }

    const asset = this.assetsRepository.create(createAssetDto)
    const savedAsset = await this.assetsRepository.save(asset)

    // Generate QR code
    await this.generateQrCode(savedAsset.id)

    // Register asset on StarkNet
    try {
      const onChainId = await this.starknetService.registerAsset(savedAsset)
      if (onChainId) {
        savedAsset.onChainId = onChainId
        return this.assetsRepository.save(savedAsset)
      }
    } catch (error) {
      console.error("Failed to register asset on StarkNet:", error)
    }

    return savedAsset
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id)

    // Check if serial number is being updated and is unique
    if (updateAssetDto.serialNumber && updateAssetDto.serialNumber !== asset.serialNumber) {
      const existingAsset = await this.assetsRepository.findOne({
        where: { serialNumber: updateAssetDto.serialNumber },
      })

      if (existingAsset) {
        throw new BadRequestException(`Asset with serial number ${updateAssetDto.serialNumber} already exists`)
      }
    }

    Object.assign(asset, updateAssetDto)
    return this.assetsRepository.save(asset)
  }

  async remove(id: string): Promise<void> {
    const asset = await this.findOne(id)

    // If asset has onChainId, decommission it on StarkNet
    if (asset.onChainId) {
      try {
        await this.starknetService.decommissionAsset(asset.id)
      } catch (error) {
        console.error("Failed to decommission asset on StarkNet:", error)
      }
    }

    await this.assetsRepository.remove(asset)
  }

  async assignToUser(id: string, userId: string, requestedById: string): Promise<Asset> {
    const asset = await this.findOne(id)

    if (asset.status === AssetStatus.RETIRED) {
      throw new BadRequestException("Cannot assign a retired asset")
    }

    // Create a transfer record
    await this.assetTransfersService.create(
      {
        assetId: id,
        transferType: asset.assignedToId ? TransferType.USER_TO_USER : TransferType.INITIAL_ASSIGNMENT,
        fromUserId: asset.assignedToId,
        toUserId: userId,
        fromDepartment: asset.department,
        toDepartment: asset.department, // Same department
        transferDate: new Date(),
        reason: "Asset assignment",
      },
      requestedById,
    )

    // Update asset status
    asset.assignedToId = userId
    asset.status = AssetStatus.ASSIGNED

    const updatedAsset = await this.assetsRepository.save(asset)

    // Record ownership transfer on StarkNet
    if (asset.onChainId) {
      try {
        await this.starknetService.transferAssetOwnership(asset, userId)
      } catch (error) {
        console.error("Failed to record ownership transfer on StarkNet:", error)
      }
    }

    // Send notification to the user
    await this.notificationsService.createNotification({
      userId,
      title: "Asset Assigned",
      message: `Asset ${asset.name} (${asset.assetTag}) has been assigned to you`,
      type: "asset_assignment",
      referenceId: asset.id,
    })

    return updatedAsset
  }

  async assignToDepartment(id: string, department: string, requestedById: string): Promise<Asset> {
    const asset = await this.findOne(id)

    if (asset.status === AssetStatus.RETIRED) {
      throw new BadRequestException("Cannot assign a retired asset")
    }

    // Create a transfer record
    await this.assetTransfersService.create(
      {
        assetId: id,
        transferType: asset.assignedToId ? TransferType.USER_TO_DEPARTMENT : TransferType.DEPARTMENT_TO_DEPARTMENT,
        fromUserId: asset.assignedToId,
        fromDepartment: asset.department,
        toDepartment: department,
        transferDate: new Date(),
        reason: "Department assignment",
      },
      requestedById,
    )

    // Update asset
    asset.assignedToId = null
    asset.department = department
    asset.status = AssetStatus.AVAILABLE

    return this.assetsRepository.save(asset)
  }

  async unassignFromUser(id: string, requestedById: string): Promise<Asset> {
    const asset = await this.findOne(id)

    if (!asset.assignedToId) {
      throw new BadRequestException("Asset is not assigned to any user")
    }

    // Create a transfer record
    await this.assetTransfersService.create(
      {
        assetId: id,
        transferType: TransferType.USER_TO_DEPARTMENT,
        fromUserId: asset.assignedToId,
        fromDepartment: asset.department,
        toDepartment: asset.department,
        transferDate: new Date(),
        reason: "Asset unassignment",
      },
      requestedById,
    )

    // Update asset
    asset.assignedToId = null
    asset.status = AssetStatus.AVAILABLE
    return this.assetsRepository.save(asset)
  }

  async generateQrCode(id: string): Promise<{ qrCodeUrl: string }> {
    const asset = await this.findOne(id)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "uploads", "qrcodes")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate QR code with asset information
    const assetInfo = {
      id: asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      assetTag: asset.assetTag,
      category: asset.category,
      department: asset.department,
    }

    const qrCodeFileName = `asset-${id}.png`
    const qrCodePath = path.join(uploadsDir, qrCodeFileName)

    await QRCode.toFile(qrCodePath, JSON.stringify(assetInfo), {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
    })

    const qrCodeUrl = `${process.env.API_URL || "http://localhost:3001"}/uploads/qrcodes/${qrCodeFileName}`

    // Update asset with QR code URL
    asset.qrCode = qrCodeUrl
    await this.assetsRepository.save(asset)

    return { qrCodeUrl }
  }

  async getAssetsByUser(userId: string): Promise<Asset[]> {
    return this.assetsRepository.find({
      where: { assignedToId: userId },
      relations: ["assignedTo"],
    })
  }

  async getAssetsByDepartment(department: string): Promise<Asset[]> {
    return this.assetsRepository.find({
      where: { department },
      relations: ["assignedTo"],
    })
  }

  async getAssignmentHistory(id: string): Promise<any[]> {
    const asset = await this.findOne(id)

    // Get transfer history from database
    const transfers = await this.assetTransfersService.getAssetTransferHistory(id)

    // Get on-chain history if available
    let onChainHistory = []
    if (asset.onChainId) {
      try {
        onChainHistory = await this.starknetService.getAssetTransferHistory(asset.id)
      } catch (error) {
        console.error("Failed to get on-chain transfer history:", error)
      }
    }

    // Combine and sort history
    const history = [
      ...transfers.map((t) => ({
        date: new Date(t.transferDate),
        type: "transfer",
        fromUser: t.fromUser?.name,
        toUser: t.toUser?.name,
        fromDepartment: t.fromDepartment,
        toDepartment: t.toDepartment,
        status: t.status,
        onChainId: t.onChainId,
        source: "database",
      })),
      ...onChainHistory.map((h) => ({
        date: new Date(h.timestamp),
        type: "transfer",
        fromUser: h.fromOwner,
        toUser: h.toOwner,
        status: "completed",
        source: "blockchain",
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    return history
  }
}
