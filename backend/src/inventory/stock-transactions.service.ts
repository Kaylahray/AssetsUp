import { Injectable, BadRequestException } from "@nestjs/common"
import type { StockTransaction } from "./entities/stock-transaction.entity"
import type { CreateStockTransactionDto } from "./dto/stock-transaction.dto"
import type { InventoryService } from "./inventory.service"
import type { StarknetService } from "../starknet/starknet.service"
import type { StockTransactionRepository } from "./repositories/stock-transaction.repository"

@Injectable()
export class StockTransactionsService {
  constructor(
    private transactionRepository: StockTransactionRepository,
    private inventoryService: InventoryService,
    private starknetService: StarknetService,
  ) {}

  async create(createTransactionDto: CreateStockTransactionDto, userId?: string): Promise<StockTransaction> {
    const item = await this.inventoryService.findOne(createTransactionDto.inventoryItemId)

    const quantityBefore = item.quantity
    let quantityAfter = quantityBefore

    // Calculate new quantity based on transaction type
    switch (createTransactionDto.type) {
      case "stock_in":
      case "return":
        quantityAfter = quantityBefore + createTransactionDto.quantity
        break
      case "stock_out":
      case "damage":
      case "expired":
        if (quantityBefore < createTransactionDto.quantity) {
          throw new BadRequestException("Insufficient stock for this transaction")
        }
        quantityAfter = quantityBefore - createTransactionDto.quantity
        break
      case "adjustment":
        quantityAfter = createTransactionDto.quantity
        break
    }

    // Create transaction record
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      quantityBefore,
      quantityAfter,
      performedById: userId,
    })

    const savedTransaction = await this.transactionRepository.save(transaction)

    // Update inventory quantity
    await this.inventoryService.updateQuantity(item.id, quantityAfter)

    // Record on blockchain
    try {
      await this.starknetService.recordStockTransaction(
        item.id,
        createTransactionDto.type,
        createTransactionDto.quantity,
        quantityBefore,
        quantityAfter,
      )
    } catch (error) {
      console.error("Failed to record transaction on blockchain:", error)
    }

    return savedTransaction
  }

  async findAll(filters?: {
    type?: string
    search?: string
    startDate?: Date
    endDate?: Date
  }): Promise<StockTransaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.inventoryItem", "item")
      .leftJoinAndSelect("transaction.performedBy", "user")

    if (filters?.type && filters.type !== "all") {
      query.andWhere("transaction.type = :type", { type: filters.type })
    }

    if (filters?.search) {
      query.andWhere(
        "(item.name ILIKE :search OR transaction.referenceNumber ILIKE :search OR transaction.requestedBy ILIKE :search)",
        { search: `%${filters.search}%` },
      )
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere("transaction.createdAt BETWEEN :startDate AND :endDate", {
        startDate: filters.startDate,
        endDate: filters.endDate,
      })
    }

    return query.orderBy("transaction.createdAt", "DESC").getMany()
  }

  async findByItem(itemId: string): Promise<StockTransaction[]> {
    return this.transactionRepository.find({
      where: { inventoryItemId: itemId },
      relations: ["performedBy"],
      order: { createdAt: "DESC" },
    })
  }

  async getRecent(limit = 10): Promise<StockTransaction[]> {
    return this.transactionRepository.find({
      relations: ["inventoryItem", "performedBy"],
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalIn: number
    totalOut: number
    totalAdjustments: number
    totalDamaged: number
    totalExpired: number
  }> {
    const query = this.transactionRepository.createQueryBuilder("transaction")

    if (startDate && endDate) {
      query.where("transaction.createdAt BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
    }

    const transactions = await query.getMany()

    const summary = {
      totalIn: 0,
      totalOut: 0,
      totalAdjustments: 0,
      totalDamaged: 0,
      totalExpired: 0,
    }

    transactions.forEach((transaction) => {
      switch (transaction.type) {
        case "stock_in":
          summary.totalIn += transaction.quantity
          break
        case "stock_out":
          summary.totalOut += transaction.quantity
          break
        case "adjustment":
          summary.totalAdjustments++
          break
        case "damage":
          summary.totalDamaged += transaction.quantity
          break
        case "expired":
          summary.totalExpired += transaction.quantity
          break
      }
    })

    return summary
  }

  async adjustStock(
    itemId: string,
    adjustment: { quantity: number; reason: string },
    userId?: string,
  ): Promise<StockTransaction> {
    const createDto: CreateStockTransactionDto = {
      inventoryItemId: itemId,
      type: "adjustment",
      quantity: adjustment.quantity,
      reason: adjustment.reason,
    }

    return this.create(createDto, userId)
  }
}
