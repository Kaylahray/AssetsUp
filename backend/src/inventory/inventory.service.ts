import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { InventoryItem } from "./entities/inventory-item.entity"
import type { CreateInventoryItemDto } from "./dto/create-inventory-item.dto"
import type { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto"
import type { NotificationsService } from "../notifications/notifications.service"
import type { StarknetService } from "../starknet/starknet.service"

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private notificationsService: NotificationsService,
    private starknetService: StarknetService,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryRepository.create(createInventoryItemDto)
    const savedItem = await this.inventoryRepository.save(item)

    // Register on blockchain
    try {
      await this.starknetService.registerInventoryItem(savedItem.id, savedItem.name, savedItem.quantity, savedItem.unit)
    } catch (error) {
      console.error("Failed to register inventory item on blockchain:", error)
    }

    return savedItem
  }

  async findAll(filters?: {
    category?: string
    department?: string
    search?: string
    lowStock?: boolean
  }): Promise<InventoryItem[]> {
    const query = this.inventoryRepository.createQueryBuilder("item")

    if (filters?.category && filters.category !== "all") {
      query.andWhere("item.category = :category", { category: filters.category })
    }

    if (filters?.department && filters.department !== "all") {
      query.andWhere("item.department = :department", { department: filters.department })
    }

    if (filters?.search) {
      query.andWhere("(item.name ILIKE :search OR item.sku ILIKE :search OR item.notes ILIKE :search)", {
        search: `%${filters.search}%`,
      })
    }

    if (filters?.lowStock) {
      query.andWhere("item.quantity <= item.reorderPoint")
    }

    return query.orderBy("item.name", "ASC").getMany()
  }

  async findOne(id: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ["stockTransactions"],
    })

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`)
    }

    return item
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id)

    Object.assign(item, updateInventoryItemDto)
    const updatedItem = await this.inventoryRepository.save(item)

    // Check for low stock
    if (updatedItem.quantity <= updatedItem.reorderPoint) {
      await this.notificationsService.sendLowStockAlert(updatedItem)
    }

    return updatedItem
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id)
    await this.inventoryRepository.remove(item)
  }

  async getLowStock(): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .where("item.quantity <= item.reorderPoint")
      .andWhere("item.quantity > 0")
      .orderBy("item.quantity", "ASC")
      .getMany()
  }

  async getOutOfStock(): Promise<InventoryItem[]> {
    return this.inventoryRepository.find({
      where: { quantity: 0 },
      order: { name: "ASC" },
    })
  }

  async getSummary(): Promise<{
    totalValue: number
    itemCount: number
    lowStockCount: number
    outOfStockCount: number
  }> {
    const items = await this.inventoryRepository.find()

    const totalValue = items.reduce((sum, item) => sum + item.quantity * Number(item.cost), 0)
    const itemCount = items.length
    const lowStockCount = items.filter((item) => item.isLowStock).length
    const outOfStockCount = items.filter((item) => item.isOutOfStock).length

    return {
      totalValue,
      itemCount,
      lowStockCount,
      outOfStockCount,
    }
  }

  async getByCategory(): Promise<any[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .select("item.category", "category")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(item.quantity * item.cost)", "totalValue")
      .groupBy("item.category")
      .getRawMany()
  }

  async getByDepartment(): Promise<any[]> {
    return this.inventoryRepository
      .createQueryBuilder("item")
      .select("item.department", "department")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(item.quantity * item.cost)", "totalValue")
      .groupBy("item.department")
      .getRawMany()
  }

  async updateQuantity(id: string, newQuantity: number): Promise<InventoryItem> {
    const item = await this.findOne(id)
    item.quantity = newQuantity
    const updatedItem = await this.inventoryRepository.save(item)

    // Check for low stock
    if (updatedItem.quantity <= updatedItem.reorderPoint) {
      await this.notificationsService.sendLowStockAlert(updatedItem)
    }

    return updatedItem
  }
}
