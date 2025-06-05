import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, LessThan, MoreThanOrEqual } from "typeorm"
import { AssetCheckout, CheckoutStatus } from "./entities/asset-checkout.entity"
import { Asset, AssetStatus } from "./entities/asset.entity"
import { User } from "../users/entities/user.entity"
import type { CreateAssetCheckoutDto } from "./dto/create-asset-checkout.dto"
import type { UpdateAssetCheckoutDto } from "./dto/update-asset-checkout.dto"
import type { NotificationsService } from "../notifications/notifications.service"

@Injectable()
export class AssetCheckoutsService {
  private checkoutsRepository: Repository<AssetCheckout>
  private assetsRepository: Repository<Asset>
  private usersRepository: Repository<User>

  constructor(
    @InjectRepository(AssetCheckout)
    checkoutsRepository: Repository<AssetCheckout>,
    @InjectRepository(Asset)
    assetsRepository: Repository<Asset>,
    @InjectRepository(User)
    usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {
    this.checkoutsRepository = checkoutsRepository
    this.assetsRepository = assetsRepository
    this.usersRepository = usersRepository
  }

  async findAll(filters?: {
    assetId?: string
    userId?: string
    status?: CheckoutStatus
    overdue?: boolean
  }): Promise<AssetCheckout[]> {
    const query = this.checkoutsRepository
      .createQueryBuilder("checkout")
      .leftJoinAndSelect("checkout.asset", "asset")
      .leftJoinAndSelect("checkout.checkedOutBy", "checkedOutBy")
      .leftJoinAndSelect("checkout.checkedInBy", "checkedInBy")

    if (filters) {
      if (filters.assetId) {
        query.andWhere("checkout.assetId = :assetId", { assetId: filters.assetId })
      }

      if (filters.userId) {
        query.andWhere("checkout.checkedOutById = :userId", { userId: filters.userId })
      }

      if (filters.status) {
        query.andWhere("checkout.status = :status", { status: filters.status })
      }

      if (filters.overdue) {
        const now = new Date()
        query.andWhere("checkout.dueDate < :now AND checkout.status = :status", {
          now,
          status: CheckoutStatus.ACTIVE,
        })
      }
    }

    return query.orderBy("checkout.checkoutDate", "DESC").getMany()
  }

  async findOne(id: string): Promise<AssetCheckout> {
    const checkout = await this.checkoutsRepository.findOne({
      where: { id },
      relations: ["asset", "checkedOutBy", "checkedInBy"],
    })

    if (!checkout) {
      throw new NotFoundException(`Asset checkout with ID ${id} not found`)
    }

    return checkout
  }

  async create(createCheckoutDto: CreateAssetCheckoutDto, userId: string): Promise<AssetCheckout> {
    // Validate asset exists and is available
    const asset = await this.assetsRepository.findOne({
      where: { id: createCheckoutDto.assetId },
    })

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${createCheckoutDto.assetId} not found`)
    }

    if (asset.status !== AssetStatus.AVAILABLE) {
      throw new BadRequestException(`Asset is not available for checkout (current status: ${asset.status})`)
    }

    // Check if user exists
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    // Create checkout record
    const checkout = this.checkoutsRepository.create({
      ...createCheckoutDto,
      checkedOutById: userId,
      status: CheckoutStatus.ACTIVE,
    })

    // Update asset status
    asset.status = AssetStatus.CHECKED_OUT
    await this.assetsRepository.save(asset)

    // Save checkout record
    const savedCheckout = await this.checkoutsRepository.save(checkout)

    return savedCheckout
  }

  async update(id: string, updateCheckoutDto: UpdateAssetCheckoutDto, userId?: string): Promise<AssetCheckout> {
    const checkout = await this.findOne(id)

    // If returning the asset
    if (updateCheckoutDto.status === CheckoutStatus.RETURNED && !checkout.returnDate) {
      updateCheckoutDto.returnDate = new Date()

      if (userId) {
        checkout.checkedInById = userId
      }

      // Update asset status back to available
      const asset = await this.assetsRepository.findOne({ where: { id: checkout.assetId } })
      if (asset) {
        asset.status = AssetStatus.AVAILABLE
        await this.assetsRepository.save(asset)
      }
    }

    // Update checkout record
    Object.assign(checkout, updateCheckoutDto)
    return this.checkoutsRepository.save(checkout)
  }

  async remove(id: string): Promise<void> {
    const checkout = await this.findOne(id)

    // If checkout is active, update asset status back to available
    if (checkout.status === CheckoutStatus.ACTIVE) {
      const asset = await this.assetsRepository.findOne({ where: { id: checkout.assetId } })
      if (asset) {
        asset.status = AssetStatus.AVAILABLE
        await this.assetsRepository.save(asset)
      }
    }

    await this.checkoutsRepository.remove(checkout)
  }

  async getAssetCheckoutHistory(assetId: string): Promise<AssetCheckout[]> {
    return this.checkoutsRepository.find({
      where: { assetId },
      relations: ["checkedOutBy", "checkedInBy"],
      order: { checkoutDate: "DESC" },
    })
  }

  async getUserCheckoutHistory(userId: string): Promise<AssetCheckout[]> {
    return this.checkoutsRepository.find({
      where: { checkedOutById: userId },
      relations: ["asset", "checkedInBy"],
      order: { checkoutDate: "DESC" },
    })
  }

  async getActiveCheckouts(): Promise<AssetCheckout[]> {
    return this.checkoutsRepository.find({
      where: { status: CheckoutStatus.ACTIVE },
      relations: ["asset", "checkedOutBy"],
      order: { dueDate: "ASC" },
    })
  }

  async getOverdueCheckouts(): Promise<AssetCheckout[]> {
    const now = new Date()
    return this.checkoutsRepository.find({
      where: {
        status: CheckoutStatus.ACTIVE,
        dueDate: LessThan(now),
      },
      relations: ["asset", "checkedOutBy"],
      order: { dueDate: "ASC" },
    })
  }

  async checkForOverdueItems(): Promise<void> {
    const now = new Date()

    // Find active checkouts that are overdue
    const overdueCheckouts = await this.checkoutsRepository.find({
      where: {
        status: CheckoutStatus.ACTIVE,
        dueDate: LessThan(now),
        notificationSent: false,
      },
      relations: ["asset", "checkedOutBy"],
    })

    // Update status and send notifications
    for (const checkout of overdueCheckouts) {
      // Update status to overdue
      checkout.status = CheckoutStatus.OVERDUE
      checkout.notificationSent = true
      await this.checkoutsRepository.save(checkout)

      // Send notification to user
      await this.notificationsService.createNotification({
        userId: checkout.checkedOutById,
        title: "Asset Overdue",
        message: `The asset ${checkout.asset.name} (${checkout.asset.assetTag}) is overdue for return. Please return it as soon as possible.`,
        type: "overdue_asset",
        referenceId: checkout.id,
      })

      // Notify asset managers
      const assetManagers = await this.usersRepository.find({
        where: { role: "asset_manager" },
      })

      for (const manager of assetManagers) {
        await this.notificationsService.createNotification({
          userId: manager.id,
          title: "Asset Overdue",
          message: `Asset ${checkout.asset.name} (${checkout.asset.assetTag}) checked out by ${checkout.checkedOutBy.name} is overdue for return.`,
          type: "overdue_asset",
          referenceId: checkout.id,
        })
      }
    }
  }

  async sendUpcomingDueReminders(): Promise<void> {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find active checkouts due tomorrow
    const upcomingDueCheckouts = await this.checkoutsRepository.find({
      where: {
        status: CheckoutStatus.ACTIVE,
        dueDate: MoreThanOrEqual(now),
        dueDate: LessThan(tomorrow),
        notificationSent: false,
      },
      relations: ["asset", "checkedOutBy"],
    })

    // Send reminder notifications
    for (const checkout of upcomingDueCheckouts) {
      // Mark notification as sent
      checkout.notificationSent = true
      await this.checkoutsRepository.save(checkout)

      // Send notification to user
      await this.notificationsService.createNotification({
        userId: checkout.checkedOutById,
        title: "Asset Due Soon",
        message: `The asset ${checkout.asset.name} (${checkout.asset.assetTag}) is due for return tomorrow. Please return it on time.`,
        type: "asset_due_reminder",
        referenceId: checkout.id,
      })
    }
  }

  async checkoutByQrCode(assetQrData: string, userId: string, dueDate: Date, purpose?: string): Promise<AssetCheckout> {
    try {
      // Parse QR data to get asset info
      const assetInfo = JSON.parse(assetQrData)

      if (!assetInfo.id) {
        throw new BadRequestException("Invalid QR code data")
      }

      // Create checkout
      return this.create(
        {
          assetId: assetInfo.id,
          checkoutDate: new Date(),
          dueDate,
          purpose,
        },
        userId,
      )
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException("Invalid QR code format")
      }
      throw error
    }
  }
}
