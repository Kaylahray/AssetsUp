import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Branch } from "../entities/branch.entity"
import type { Asset } from "../../assets/entities/asset.entity"
import type { Inventory } from "../../inventory/entities/inventory.entity"
import type { Transaction } from "../../transactions/entities/transaction.entity"
import type { BranchValidationService } from "./branch-validation.service"

export interface BranchInventoryReport {
  branchId: string
  branchName: string
  totalItems: number
  totalValue: number
  lowStockItems: number
  categories: {
    category: string
    itemCount: number
    totalValue: number
  }[]
}

export interface BranchAssetReport {
  branchId: string
  branchName: string
  totalAssets: number
  activeAssets: number
  maintenanceAssets: number
  retiredAssets: number
  totalValue: number
  utilizationRate: number
}

export interface BranchTransactionReport {
  branchId: string
  branchName: string
  totalTransactions: number
  totalVolume: number
  averageTransactionValue: number
  transactionsByType: {
    type: string
    count: number
    volume: number
  }[]
  dateRange: {
    startDate: Date
    endDate: Date
  }
}

@Injectable()
export class BranchReportingService {
  private readonly logger = new Logger(BranchReportingService.name)

  constructor(
    private readonly branchRepository: Repository<Branch>,
    private readonly assetRepository: Repository<Asset>,
    private readonly inventoryRepository: Repository<Inventory>,
    private readonly transactionRepository: Repository<Transaction>,
    private readonly branchValidationService: BranchValidationService,
  ) {}

  async getInventoryReport(branchId: string): Promise<BranchInventoryReport> {
    this.logger.log(`Generating inventory report for branch ${branchId}`)

    const branch = await this.branchValidationService.validateBranchExists(branchId)

    const inventoryQuery = this.inventoryRepository
      .createQueryBuilder("inventory")
      .where("inventory.branchId = :branchId", { branchId })

    const [totalItems, totalValue, lowStockItems] = await Promise.all([
      inventoryQuery.getCount(),
      inventoryQuery
        .select("SUM(inventory.quantity * inventory.unitPrice)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
      inventoryQuery.andWhere("inventory.quantity <= inventory.minStockLevel").getCount(),
    ])

    const categories = await this.inventoryRepository
      .createQueryBuilder("inventory")
      .select("inventory.category", "category")
      .addSelect("COUNT(*)", "itemCount")
      .addSelect("SUM(inventory.quantity * inventory.unitPrice)", "totalValue")
      .where("inventory.branchId = :branchId", { branchId })
      .groupBy("inventory.category")
      .getRawMany()

    return {
      branchId,
      branchName: branch.name,
      totalItems,
      totalValue,
      lowStockItems,
      categories: categories.map((cat) => ({
        category: cat.category,
        itemCount: Number.parseInt(cat.itemCount),
        totalValue: Number.parseFloat(cat.totalValue) || 0,
      })),
    }
  }

  async getAssetReport(branchId: string): Promise<BranchAssetReport> {
    this.logger.log(`Generating asset report for branch ${branchId}`)

    const branch = await this.branchValidationService.validateBranchExists(branchId)

    const assetQuery = this.assetRepository
      .createQueryBuilder("asset")
      .where("asset.branchId = :branchId", { branchId })

    const [totalAssets, activeAssets, maintenanceAssets, retiredAssets, totalValue] = await Promise.all([
      assetQuery.getCount(),
      assetQuery.clone().andWhere("asset.status = :status", { status: "active" }).getCount(),
      assetQuery.clone().andWhere("asset.status = :status", { status: "maintenance" }).getCount(),
      assetQuery.clone().andWhere("asset.status = :status", { status: "retired" }).getCount(),
      assetQuery
        .select("SUM(asset.value)", "total")
        .getRawOne()
        .then((result) => Number.parseFloat(result.total) || 0),
    ])

    const utilizationRate = totalAssets > 0 ? (activeAssets / totalAssets) * 100 : 0

    return {
      branchId,
      branchName: branch.name,
      totalAssets,
      activeAssets,
      maintenanceAssets,
      retiredAssets,
      totalValue,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
    }
  }

  async getTransactionReport(branchId: string, startDate?: Date, endDate?: Date): Promise<BranchTransactionReport> {
    this.logger.log(`Generating transaction report for branch ${branchId}`, { startDate, endDate })

    const branch = await this.branchValidationService.validateBranchExists(branchId)

    // Set default date range if not provided
    if (!endDate) {
      endDate = new Date()
    }
    if (!startDate) {
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1) // Last month
    }

    const transactionQuery = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.createdAt >= :startDate", { startDate })
      .andWhere("transaction.createdAt <= :endDate", { endDate })

    const [totalTransactions, volumeResult] = await Promise.all([
      transactionQuery.getCount(),
      transactionQuery
        .select("SUM(transaction.amount)", "totalVolume")
        .addSelect("AVG(transaction.amount)", "averageValue")
        .getRawOne(),
    ])

    const totalVolume = Number.parseFloat(volumeResult.totalVolume) || 0
    const averageTransactionValue = Number.parseFloat(volumeResult.averageValue) || 0

    const transactionsByType = await this.transactionRepository
      .createQueryBuilder("transaction")
      .select("transaction.type", "type")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(transaction.amount)", "volume")
      .where("transaction.branchId = :branchId", { branchId })
      .andWhere("transaction.createdAt >= :startDate", { startDate })
      .andWhere("transaction.createdAt <= :endDate", { endDate })
      .groupBy("transaction.type")
      .getRawMany()

    return {
      branchId,
      branchName: branch.name,
      totalTransactions,
      totalVolume,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
      transactionsByType: transactionsByType.map((type) => ({
        type: type.type,
        count: Number.parseInt(type.count),
        volume: Number.parseFloat(type.volume) || 0,
      })),
      dateRange: {
        startDate,
        endDate,
      },
    }
  }

  async getAllBranchesReport() {
    this.logger.log("Generating comprehensive report for all branches")

    const branches = await this.branchRepository.find({
      where: { isActive: true },
    })

    const reports = await Promise.all(
      branches.map(async (branch) => {
        const [inventoryReport, assetReport] = await Promise.all([
          this.getInventoryReport(branch.id),
          this.getAssetReport(branch.id),
        ])

        return {
          branch: {
            id: branch.id,
            name: branch.name,
            branchCode: branch.branchCode,
            city: branch.city,
            state: branch.state,
            country: branch.country,
            isActive: branch.isActive,
          },
          inventory: inventoryReport,
          assets: assetReport,
        }
      }),
    )

    return {
      generatedAt: new Date(),
      totalBranches: branches.length,
      reports,
    }
  }

  async getBranchPerformanceComparison() {
    this.logger.log("Generating branch performance comparison report")

    const branches = await this.branchRepository.find({
      where: { isActive: true },
    })

    const performanceData = await Promise.all(
      branches.map(async (branch) => {
        const [assetReport, transactionReport] = await Promise.all([
          this.getAssetReport(branch.id),
          this.getTransactionReport(branch.id),
        ])

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.branchCode,
          assetUtilization: assetReport.utilizationRate,
          totalAssetValue: assetReport.totalValue,
          transactionVolume: transactionReport.totalVolume,
          averageTransactionValue: transactionReport.averageTransactionValue,
        }
      }),
    )

    // Sort by transaction volume (descending)
    performanceData.sort((a, b) => b.transactionVolume - a.transactionVolume)

    return {
      generatedAt: new Date(),
      branches: performanceData,
      summary: {
        totalBranches: performanceData.length,
        totalAssetValue: performanceData.reduce((sum, branch) => sum + branch.totalAssetValue, 0),
        totalTransactionVolume: performanceData.reduce((sum, branch) => sum + branch.transactionVolume, 0),
        averageUtilization:
          performanceData.reduce((sum, branch) => sum + branch.assetUtilization, 0) / performanceData.length,
      },
    }
  }
}
