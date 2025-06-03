import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Branch } from "../entities/branch.entity"
import type { CreateBranchDto } from "../dto/create-branch.dto"
import type { UpdateBranchDto } from "../dto/update-branch.dto"
import type { BranchQueryDto } from "../dto/branch-query.dto"
import type { AssignAssetDto, TransferAssetDto, AssignInventoryDto } from "../dto/assign-asset.dto"
import type { Asset } from "../../assets/entities/asset.entity"
import type { Inventory } from "../../inventory/entities/inventory.entity"
import type { User } from "../../users/entities/user.entity"
import type { Transaction } from "../../transactions/entities/transaction.entity"
import type { BranchValidationService } from "./branch-validation.service"

@Injectable()
export class BranchService {
  private readonly logger = new Logger(BranchService.name)

  constructor(
    private readonly branchRepository: Repository<Branch>,
    private readonly assetRepository: Repository<Asset>,
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly userRepository: Repository<User>,
    private readonly transactionRepository: Repository<Transaction>,
    private readonly branchValidationService: BranchValidationService,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    this.logger.log(`Creating new branch with code: ${createBranchDto.branchCode}`)

    // Validate branch code uniqueness
    await this.branchValidationService.validateBranchCodeUniqueness(createBranchDto.branchCode)

    // Validate manager if provided
    if (createBranchDto.managerId) {
      await this.branchValidationService.validateManagerExists(createBranchDto.managerId)
    }

    const branch = this.branchRepository.create(createBranchDto)
    const savedBranch = await this.branchRepository.save(branch)

    this.logger.log(`Branch created successfully with ID: ${savedBranch.id}`)
    return savedBranch
  }

  async findAll(query: BranchQueryDto) {
    this.logger.log("Fetching branches with filters", query)

    const { search, city, state, country, isActive, page, limit, sortBy, sortOrder } = query

    const queryBuilder = this.branchRepository.createQueryBuilder("branch")

    // Apply filters
    if (search) {
      queryBuilder.andWhere("(branch.name ILIKE :search OR branch.branchCode ILIKE :search)", { search: `%${search}%` })
    }

    if (city) {
      queryBuilder.andWhere("branch.city ILIKE :city", { city: `%${city}%` })
    }

    if (state) {
      queryBuilder.andWhere("branch.state ILIKE :state", { state: `%${state}%` })
    }

    if (country) {
      queryBuilder.andWhere("branch.country ILIKE :country", { country: `%${country}%` })
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere("branch.isActive = :isActive", { isActive })
    }

    // Apply sorting
    queryBuilder.orderBy(`branch.${sortBy}`, sortOrder)

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit)

    const [branches, total] = await queryBuilder.getManyAndCount()

    return {
      data: branches,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string): Promise<Branch> {
    this.logger.log(`Fetching branch with ID: ${id}`)

    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ["assets", "inventories", "users"],
    })

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`)
    }

    return branch
  }

  async findByCode(branchCode: string): Promise<Branch> {
    this.logger.log(`Fetching branch with code: ${branchCode}`)

    const branch = await this.branchRepository.findOne({
      where: { branchCode },
      relations: ["assets", "inventories", "users"],
    })

    if (!branch) {
      throw new NotFoundException(`Branch with code ${branchCode} not found`)
    }

    return branch
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    this.logger.log(`Updating branch with ID: ${id}`)

    const branch = await this.findOne(id)

    // Validate branch code uniqueness if being updated
    if (updateBranchDto.branchCode && updateBranchDto.branchCode !== branch.branchCode) {
      await this.branchValidationService.validateBranchCodeUniqueness(updateBranchDto.branchCode)
    }

    // Validate manager if being updated
    if (updateBranchDto.managerId && updateBranchDto.managerId !== branch.managerId) {
      await this.branchValidationService.validateManagerExists(updateBranchDto.managerId)
    }

    Object.assign(branch, updateBranchDto)
    const updatedBranch = await this.branchRepository.save(branch)

    this.logger.log(`Branch updated successfully with ID: ${id}`)
    return updatedBranch
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to delete branch with ID: ${id}`)

    const branch = await this.findOne(id)

    // Check for associated data
    const [assetCount, inventoryCount, transactionCount] = await Promise.all([
      this.assetRepository.count({ where: { branch: { id } } }),
      this.inventoryRepository.count({ where: { branch: { id } } }),
      this.transactionRepository.count({ where: { branch: { id } } }),
    ])

    if (assetCount > 0 || inventoryCount > 0 || transactionCount > 0) {
      throw new BadRequestException(
        `Cannot delete branch with associated data. Assets: ${assetCount}, Inventories: ${inventoryCount}, Transactions: ${transactionCount}. Please reassign or remove them first.`,
      )
    }

    await this.branchRepository.remove(branch)
    this.logger.log(`Branch deleted successfully with ID: ${id}`)
  }

  async assignAssets(branchId: string, assignAssetDto: AssignAssetDto): Promise<void> {
    this.logger.log(`Assigning assets to branch ${branchId}`, assignAssetDto)

    const branch = await this.findOne(branchId)

    const assets = await this.assetRepository.findByIds(assignAssetDto.assetIds)

    if (assets.length !== assignAssetDto.assetIds.length) {
      const foundIds = assets.map((asset) => asset.id)
      const missingIds = assignAssetDto.assetIds.filter((id) => !foundIds.includes(id))
      throw new BadRequestException(`Assets not found: ${missingIds.join(", ")}`)
    }

    // Update assets to assign them to the branch
    await this.assetRepository.update(assignAssetDto.assetIds, { branch: { id: branchId } })

    this.logger.log(`Assets assigned successfully to branch ${branchId}`)
  }

  async transferAssets(branchId: string, transferAssetDto: TransferAssetDto): Promise<void> {
    this.logger.log(`Transferring assets from branch ${branchId} to ${transferAssetDto.targetBranchId}`)

    const [sourceBranch, targetBranch] = await Promise.all([
      this.findOne(branchId),
      this.findOne(transferAssetDto.targetBranchId),
    ])

    const assets = await this.assetRepository.find({
      where: {
        id: { $in: transferAssetDto.assetIds } as any,
        branch: { id: branchId },
      },
    })

    if (assets.length !== transferAssetDto.assetIds.length) {
      throw new BadRequestException("Some assets not found in source branch")
    }

    // Transfer assets to target branch
    await this.assetRepository.update(transferAssetDto.assetIds, { branch: { id: transferAssetDto.targetBranchId } })

    this.logger.log(`Assets transferred successfully from ${branchId} to ${transferAssetDto.targetBranchId}`)
  }

  async assignInventories(branchId: string, assignInventoryDto: AssignInventoryDto): Promise<void> {
    this.logger.log(`Assigning inventories to branch ${branchId}`, assignInventoryDto)

    const branch = await this.findOne(branchId)

    const inventories = await this.inventoryRepository.findByIds(assignInventoryDto.inventoryIds)

    if (inventories.length !== assignInventoryDto.inventoryIds.length) {
      const foundIds = inventories.map((inventory) => inventory.id)
      const missingIds = assignInventoryDto.inventoryIds.filter((id) => !foundIds.includes(id))
      throw new BadRequestException(`Inventories not found: ${missingIds.join(", ")}`)
    }

    // Update inventories to assign them to the branch
    await this.inventoryRepository.update(assignInventoryDto.inventoryIds, { branch: { id: branchId } })

    this.logger.log(`Inventories assigned successfully to branch ${branchId}`)
  }

  async getBranchStats(branchId: string) {
    this.logger.log(`Fetching statistics for branch ${branchId}`)

    const branch = await this.findOne(branchId)

    const [assetCount, activeAssetCount, inventoryCount, userCount, transactionCount] = await Promise.all([
      this.assetRepository.count({ where: { branch: { id: branchId } } }),
      this.assetRepository.count({
        where: {
          branch: { id: branchId },
          status: "active",
        },
      }),
      this.inventoryRepository.count({ where: { branch: { id: branchId } } }),
      this.userRepository
        .createQueryBuilder("user")
        .innerJoin("user.branches", "branch")
        .where("branch.id = :branchId", { branchId })
        .getCount(),
      this.transactionRepository.count({ where: { branch: { id: branchId } } }),
    ])

    return {
      branch: {
        id: branch.id,
        name: branch.name,
        branchCode: branch.branchCode,
      },
      stats: {
        totalAssets: assetCount,
        activeAssets: activeAssetCount,
        totalInventories: inventoryCount,
        totalUsers: userCount,
        totalTransactions: transactionCount,
      },
    }
  }

  async assignUserToBranch(branchId: string, userId: string): Promise<void> {
    this.logger.log(`Assigning user ${userId} to branch ${branchId}`)

    const [branch, user] = await Promise.all([
      this.findOne(branchId),
      this.userRepository.findOne({ where: { id: userId }, relations: ["branches"] }),
    ])

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    // Check if user is already assigned to this branch
    const isAlreadyAssigned = user.branches.some((b) => b.id === branchId)
    if (isAlreadyAssigned) {
      throw new ConflictException("User is already assigned to this branch")
    }

    user.branches.push(branch)
    await this.userRepository.save(user)

    this.logger.log(`User ${userId} assigned successfully to branch ${branchId}`)
  }

  async removeUserFromBranch(branchId: string, userId: string): Promise<void> {
    this.logger.log(`Removing user ${userId} from branch ${branchId}`)

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["branches"],
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`)
    }

    user.branches = user.branches.filter((branch) => branch.id !== branchId)
    await this.userRepository.save(user)

    this.logger.log(`User ${userId} removed successfully from branch ${branchId}`)
  }
}
