import { Injectable } from "@nestjs/common"
import { type Repository, Between, LessThan, MoreThan } from "typeorm"
import { type Asset, AssetStatus } from "../assets/entities/asset.entity"
import type { AssetTransfer } from "../assets/entities/asset-transfer.entity"
import type { AssetCheckout } from "../assets/entities/asset-checkout.entity"
import type { MaintenanceRecord } from "../maintenance/entities/maintenance-record.entity"
import type { InventoryItem } from "../inventory/entities/inventory-item.entity"
import type { StockTransaction } from "../inventory/entities/stock-transaction.entity"
import type { AuditLog } from "../audit/entities/audit-log.entity"
import type { Branch } from "../branches/entities/branch.entity"

@Injectable()
export class ReportsService {
  constructor(
    private readonly assetsRepository: Repository<Asset>,
    private readonly transfersRepository: Repository<AssetTransfer>,
    private readonly checkoutsRepository: Repository<AssetCheckout>,
    private readonly maintenanceRepository: Repository<MaintenanceRecord>,
    private inventoryRepository: Repository<InventoryItem>,
    private stockTransactionRepository: Repository<StockTransaction>,
    private auditLogRepository: Repository<AuditLog>,
    private branchRepository: Repository<Branch>,
  ) {}

  async getAssetDistributionReport() {
    const assetsByCategory = await this.assetsRepository
      .createQueryBuilder("asset")
      .select("asset.category", "category")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(CAST(asset.purchasePrice AS DECIMAL))", "totalValue")
      .groupBy("asset.category")
      .getRawMany()

    const assetsByDepartment = await this.assetsRepository
      .createQueryBuilder("asset")
      .select("asset.department", "department")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(CAST(asset.purchasePrice AS DECIMAL))", "totalValue")
      .groupBy("asset.department")
      .getRawMany()

    const assetsByStatus = await this.assetsRepository
      .createQueryBuilder("asset")
      .select("asset.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("asset.status")
      .getRawMany()

    const assetsByLocation = await this.assetsRepository
      .createQueryBuilder("asset")
      .select("asset.location", "location")
      .addSelect("COUNT(*)", "count")
      .groupBy("asset.location")
      .getRawMany()

    return {
      byCategory: assetsByCategory,
      byDepartment: assetsByDepartment,
      byStatus: assetsByStatus,
      byLocation: assetsByLocation,
    }
  }

  async getMaintenanceReport(startDate?: Date, endDate?: Date) {
    const query = this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .leftJoinAndSelect("maintenance.asset", "asset")

    if (startDate && endDate) {
      query.where("maintenance.date BETWEEN :startDate AND :endDate", { startDate, endDate })
    }

    const maintenanceRecords = await query.getMany()

    const upcomingMaintenance = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .leftJoinAndSelect("maintenance.asset", "asset")
      .where("maintenance.date > :now", { now: new Date() })
      .andWhere("maintenance.status = :status", { status: "scheduled" })
      .orderBy("maintenance.date", "ASC")
      .limit(10)
      .getMany()

    const overdueMaintenance = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .leftJoinAndSelect("maintenance.asset", "asset")
      .where("maintenance.date < :now", { now: new Date() })
      .andWhere("maintenance.status = :status", { status: "scheduled" })
      .getMany()

    const maintenanceCosts = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("SUM(CAST(maintenance.cost AS DECIMAL))", "totalCost")
      .addSelect("COUNT(*)", "count")
      .addSelect("AVG(CAST(maintenance.cost AS DECIMAL))", "averageCost")
      .where("maintenance.status = :status", { status: "completed" })
      .getRawOne()

    return {
      records: maintenanceRecords,
      upcoming: upcomingMaintenance,
      overdue: overdueMaintenance,
      costs: maintenanceCosts,
    }
  }

  async getDepreciationReport() {
    const assets = await this.assetsRepository.find({
      where: { purchaseDate: MoreThan(new Date(0)) },
      relations: ["branch"],
    })

    const depreciationData = assets.map((asset) => {
      const purchaseDate = new Date(asset.purchaseDate)
      const currentDate = new Date()
      const ageInYears = (currentDate.getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)

      // Simple straight-line depreciation over 5 years
      const depreciationRate = 0.2 // 20% per year
      const currentValue = Math.max(0, asset.purchasePrice * (1 - depreciationRate * ageInYears))
      const depreciatedAmount = asset.purchasePrice - currentValue

      return {
        assetId: asset.id,
        assetName: asset.name,
        assetTag: asset.assetTag,
        category: asset.category,
        purchasePrice: asset.purchasePrice,
        purchaseDate: asset.purchaseDate,
        ageInYears: Math.round(ageInYears * 10) / 10,
        currentValue: Math.round(currentValue * 100) / 100,
        depreciatedAmount: Math.round(depreciatedAmount * 100) / 100,
        depreciationRate: depreciationRate * 100 + "%",
        branch: asset.branch ? asset.branch.name : "Unassigned",
        department: asset.department || "Unassigned",
      }
    })

    const totalOriginalValue = depreciationData.reduce((sum, item) => sum + item.purchasePrice, 0)
    const totalCurrentValue = depreciationData.reduce((sum, item) => sum + item.currentValue, 0)
    const totalDepreciation = totalOriginalValue - totalCurrentValue

    // Group by category for category-based depreciation analysis
    const depreciationByCategory = {}
    depreciationData.forEach((asset) => {
      if (!depreciationByCategory[asset.category]) {
        depreciationByCategory[asset.category] = {
          originalValue: 0,
          currentValue: 0,
          depreciatedAmount: 0,
          count: 0,
        }
      }
      depreciationByCategory[asset.category].originalValue += asset.purchasePrice
      depreciationByCategory[asset.category].currentValue += asset.currentValue
      depreciationByCategory[asset.category].depreciatedAmount += asset.depreciatedAmount
      depreciationByCategory[asset.category].count += 1
    })

    // Group by branch for branch-based depreciation analysis
    const depreciationByBranch = {}
    depreciationData.forEach((asset) => {
      const branchName = asset.branch
      if (!depreciationByBranch[branchName]) {
        depreciationByBranch[branchName] = {
          originalValue: 0,
          currentValue: 0,
          depreciatedAmount: 0,
          count: 0,
        }
      }
      depreciationByBranch[branchName].originalValue += asset.purchasePrice
      depreciationByBranch[branchName].currentValue += asset.currentValue
      depreciationByBranch[branchName].depreciatedAmount += asset.depreciatedAmount
      depreciationByBranch[branchName].count += 1
    })

    // Calculate depreciation forecast for next 5 years
    const forecastYears = 5
    const forecast = []

    for (let year = 1; year <= forecastYears; year++) {
      const yearlyDepreciation = assets.reduce((sum, asset) => {
        const purchaseDate = new Date(asset.purchaseDate)
        const forecastDate = new Date()
        forecastDate.setFullYear(forecastDate.getFullYear() + year)

        const ageInYearsNow = (new Date().getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
        const ageInYearsFuture = (forecastDate.getTime() - purchaseDate.getTime()) / (365 * 24 * 60 * 60 * 1000)

        const depreciationRate = 0.2 // 20% per year
        const currentValue = Math.max(0, asset.purchasePrice * (1 - depreciationRate * ageInYearsNow))
        const futureValue = Math.max(0, asset.purchasePrice * (1 - depreciationRate * ageInYearsFuture))

        return sum + (currentValue - futureValue)
      }, 0)

      forecast.push({
        year: new Date().getFullYear() + year,
        depreciation: Math.round(yearlyDepreciation * 100) / 100,
        remainingValue: Math.round((totalCurrentValue - yearlyDepreciation) * 100) / 100,
      })
    }

    return {
      assets: depreciationData,
      summary: {
        totalOriginalValue,
        totalCurrentValue,
        totalDepreciation,
        averageDepreciationPercentage: totalOriginalValue > 0 ? (totalDepreciation / totalOriginalValue) * 100 : 0,
      },
      byCategory: Object.entries(depreciationByCategory).map(([category, data]) => ({
        category,
        ...data,
        depreciationPercentage: data.originalValue > 0 ? (data.depreciatedAmount / data.originalValue) * 100 : 0,
      })),
      byBranch: Object.entries(depreciationByBranch).map(([branch, data]) => ({
        branch,
        ...data,
        depreciationPercentage: data.originalValue > 0 ? (data.depreciatedAmount / data.originalValue) * 100 : 0,
      })),
      forecast,
    }
  }

  async getCheckoutReport(startDate?: Date, endDate?: Date) {
    const query = this.checkoutsRepository
      .createQueryBuilder("checkout")
      .leftJoinAndSelect("checkout.asset", "asset")
      .leftJoinAndSelect("checkout.checkedOutBy", "user")

    if (startDate && endDate) {
      query.where("checkout.checkoutDate BETWEEN :startDate AND :endDate", { startDate, endDate })
    }

    const checkouts = await query.getMany()

    const activeCheckouts = await this.checkoutsRepository.count({
      where: { status: "active" },
    })

    const overdueCheckouts = await this.checkoutsRepository.count({
      where: {
        status: "overdue",
      },
    })

    const checkoutsByUser = await this.checkoutsRepository
      .createQueryBuilder("checkout")
      .leftJoin("checkout.checkedOutBy", "user")
      .select("user.name", "userName")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.name")
      .getRawMany()

    return {
      checkouts,
      summary: {
        total: checkouts.length,
        active: activeCheckouts,
        overdue: overdueCheckouts,
      },
      byUser: checkoutsByUser,
    }
  }

  async getInventoryReport() {
    const items = await this.inventoryRepository.find()

    const lowStockItems = items.filter((item) => item.quantity <= item.reorderPoint)
    const outOfStockItems = items.filter((item) => item.quantity === 0)

    const totalValue = items.reduce((sum, item) => sum + item.quantity * item.cost, 0)

    const itemsByCategory = await this.inventoryRepository
      .createQueryBuilder("item")
      .select("item.category", "category")
      .addSelect("COUNT(*)", "count")
      .addSelect("SUM(item.quantity)", "totalQuantity")
      .addSelect("SUM(item.quantity * item.cost)", "totalValue")
      .groupBy("item.category")
      .getRawMany()

    const recentTransactions = await this.stockTransactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.inventoryItem", "item")
      .orderBy("transaction.createdAt", "DESC")
      .limit(20)
      .getMany()

    return {
      summary: {
        totalItems: items.length,
        totalValue,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
      },
      lowStockItems,
      outOfStockItems,
      byCategory: itemsByCategory,
      recentTransactions,
    }
  }

  async getTransferReport(startDate?: Date, endDate?: Date) {
    const query = this.transfersRepository
      .createQueryBuilder("transfer")
      .leftJoinAndSelect("transfer.asset", "asset")
      .leftJoinAndSelect("transfer.fromUser", "fromUser")
      .leftJoinAndSelect("transfer.toUser", "toUser")

    if (startDate && endDate) {
      query.where("transfer.transferDate BETWEEN :startDate AND :endDate", { startDate, endDate })
    }

    const transfers = await query.getMany()

    const transfersByType = await this.transfersRepository
      .createQueryBuilder("transfer")
      .select("transfer.transferType", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("transfer.transferType")
      .getRawMany()

    const transfersByDepartment = await this.transfersRepository
      .createQueryBuilder("transfer")
      .select("transfer.toDepartment", "department")
      .addSelect("COUNT(*)", "count")
      .where("transfer.toDepartment IS NOT NULL")
      .groupBy("transfer.toDepartment")
      .getRawMany()

    return {
      transfers,
      summary: {
        total: transfers.length,
        byType: transfersByType,
        byDepartment: transfersByDepartment,
      },
    }
  }

  async getAuditReport(startDate?: Date, endDate?: Date) {
    const query = this.auditLogRepository.createQueryBuilder("audit")

    if (startDate && endDate) {
      query.where("audit.timestamp BETWEEN :startDate AND :endDate", { startDate, endDate })
    }

    const auditLogs = await query.orderBy("audit.timestamp", "DESC").getMany()

    const logsByEventType = await this.auditLogRepository
      .createQueryBuilder("audit")
      .select("audit.eventType", "eventType")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.eventType")
      .getRawMany()

    const logsByUser = await this.auditLogRepository
      .createQueryBuilder("audit")
      .select("audit.userId", "userId")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.userId")
      .limit(10)
      .getRawMany()

    return {
      logs: auditLogs,
      summary: {
        total: auditLogs.length,
        byEventType: logsByEventType,
        byUser: logsByUser,
      },
    }
  }

  async generateExecutiveSummary() {
    const assets = await this.assetsRepository.count()
    const activeAssets = await this.assetsRepository.count({ where: { status: AssetStatus.ASSIGNED } })
    const inventoryItems = await this.inventoryRepository.count()
    const lowStockItems = await this.inventoryRepository.count({
      where: { quantity: LessThan(10) },
    })

    const recentTransfers = await this.transfersRepository.count({
      where: {
        transferDate: Between(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
      },
    })

    const upcomingMaintenance = await this.maintenanceRepository.count({
      where: {
        date: Between(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        status: "scheduled",
      },
    })

    const totalAssetValue = await this.assetsRepository
      .createQueryBuilder("asset")
      .select("SUM(CAST(asset.purchasePrice AS DECIMAL))", "total")
      .getRawOne()

    const totalInventoryValue = await this.inventoryRepository
      .createQueryBuilder("item")
      .select("SUM(item.quantity * item.cost)", "total")
      .getRawOne()

    return {
      assets: {
        total: assets,
        active: activeAssets,
        utilizationRate: assets > 0 ? (activeAssets / assets) * 100 : 0,
      },
      inventory: {
        totalItems: inventoryItems,
        lowStockItems,
        lowStockPercentage: inventoryItems > 0 ? (lowStockItems / inventoryItems) * 100 : 0,
      },
      activity: {
        recentTransfers,
        upcomingMaintenance,
      },
      financials: {
        totalAssetValue: totalAssetValue?.total || 0,
        totalInventoryValue: totalInventoryValue?.total || 0,
        totalValue: (totalAssetValue?.total || 0) + (totalInventoryValue?.total || 0),
      },
    }
  }

  async getAssetDistributionHeatmap() {
    // Get all branches with their locations
    const branches = await this.branchRepository.find()

    // Get asset counts for each branch
    const assetCountsByBranch = await Promise.all(
      branches.map(async (branch) => {
        const count = await this.assetsRepository.count({
          where: { branchId: branch.id },
        })

        return {
          id: branch.id,
          name: branch.name,
          latitude: branch.latitude || 0,
          longitude: branch.longitude || 0,
          count,
          address: branch.address,
          city: branch.city,
          state: branch.state,
          country: branch.country,
        }
      }),
    )

    // Get asset counts by category for each branch
    const assetCategoriesByBranch = await Promise.all(
      branches.map(async (branch) => {
        const categories = await this.assetsRepository
          .createQueryBuilder("asset")
          .select("asset.category", "category")
          .addSelect("COUNT(*)", "count")
          .where("asset.branchId = :branchId", { branchId: branch.id })
          .groupBy("asset.category")
          .getRawMany()

        return {
          branchId: branch.id,
          branchName: branch.name,
          categories,
        }
      }),
    )

    // Get asset counts by department for each branch
    const assetDepartmentsByBranch = await Promise.all(
      branches.map(async (branch) => {
        const departments = await this.assetsRepository
          .createQueryBuilder("asset")
          .select("asset.department", "department")
          .addSelect("COUNT(*)", "count")
          .where("asset.branchId = :branchId", { branchId: branch.id })
          .groupBy("asset.department")
          .getRawMany()

        return {
          branchId: branch.id,
          branchName: branch.name,
          departments,
        }
      }),
    )

    return {
      branches: assetCountsByBranch,
      categoriesByBranch: assetCategoriesByBranch,
      departmentsByBranch: assetDepartmentsByBranch,
    }
  }

  async getDowntimePerformanceStats(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1) // Default to start of current year
    const end = endDate || new Date()

    // Get all maintenance records for the period
    const maintenanceRecords = await this.maintenanceRepository.find({
      where: {
        date: Between(start, end),
      },
      relations: ["asset"],
    })

    // Calculate downtime for each asset
    const assetDowntimes = {}

    maintenanceRecords.forEach((record) => {
      if (!record.asset) return

      const assetId = record.asset.id
      if (!assetDowntimes[assetId]) {
        assetDowntimes[assetId] = {
          assetId,
          assetName: record.asset.name,
          assetTag: record.asset.assetTag,
          category: record.asset.category,
          totalDowntimeHours: 0,
          maintenanceCount: 0,
          maintenanceCost: 0,
          records: [],
        }
      }

      // Calculate downtime in hours
      let downtimeHours = 0
      if (record.status === "completed" && record.completedDate) {
        const startTime = new Date(record.date).getTime()
        const endTime = new Date(record.completedDate).getTime()
        downtimeHours = (endTime - startTime) / (1000 * 60 * 60)
      } else if (record.status === "in_progress") {
        const startTime = new Date(record.date).getTime()
        const endTime = new Date().getTime()
        downtimeHours = (endTime - startTime) / (1000 * 60 * 60)
      }

      assetDowntimes[assetId].totalDowntimeHours += downtimeHours
      assetDowntimes[assetId].maintenanceCount += 1
      assetDowntimes[assetId].maintenanceCost += record.cost || 0
      assetDowntimes[assetId].records.push({
        id: record.id,
        type: record.maintenanceType,
        status: record.status,
        date: record.date,
        completedDate: record.completedDate,
        downtimeHours,
        cost: record.cost || 0,
      })
    })

    // Calculate total operational hours in the period
    const totalHoursInPeriod = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    // Calculate performance metrics for each asset
    const assetPerformance = Object.values(assetDowntimes).map((asset) => {
      const availability = ((totalHoursInPeriod - asset.totalDowntimeHours) / totalHoursInPeriod) * 100
      return {
        ...asset,
        availability: Math.min(100, Math.max(0, availability)).toFixed(2),
        mtbf:
          asset.maintenanceCount > 1
            ? ((totalHoursInPeriod - asset.totalDowntimeHours) / asset.maintenanceCount).toFixed(2)
            : "N/A", // Mean Time Between Failures
        mttr: asset.maintenanceCount > 0 ? (asset.totalDowntimeHours / asset.maintenanceCount).toFixed(2) : "N/A", // Mean Time To Repair
      }
    })

    // Calculate downtime by category
    const downtimeByCategory = {}
    Object.values(assetDowntimes).forEach((asset) => {
      if (!downtimeByCategory[asset.category]) {
        downtimeByCategory[asset.category] = {
          category: asset.category,
          totalDowntimeHours: 0,
          assetCount: 0,
          maintenanceCount: 0,
          maintenanceCost: 0,
        }
      }

      downtimeByCategory[asset.category].totalDowntimeHours += asset.totalDowntimeHours
      downtimeByCategory[asset.category].assetCount += 1
      downtimeByCategory[asset.category].maintenanceCount += asset.maintenanceCount
      downtimeByCategory[asset.category].maintenanceCost += asset.maintenanceCost
    })

    // Calculate monthly downtime trends
    const monthlyDowntime = {}
    maintenanceRecords.forEach((record) => {
      const month = new Date(record.date).toISOString().substring(0, 7) // YYYY-MM format

      if (!monthlyDowntime[month]) {
        monthlyDowntime[month] = {
          month,
          downtimeHours: 0,
          maintenanceCount: 0,
          maintenanceCost: 0,
        }
      }

      // Calculate downtime in hours
      let downtimeHours = 0
      if (record.status === "completed" && record.completedDate) {
        const startTime = new Date(record.date).getTime()
        const endTime = new Date(record.completedDate).getTime()
        downtimeHours = (endTime - startTime) / (1000 * 60 * 60)
      } else if (record.status === "in_progress") {
        const startTime = new Date(record.date).getTime()
        const endTime = new Date().getTime()
        downtimeHours = (endTime - startTime) / (1000 * 60 * 60)
      }

      monthlyDowntime[month].downtimeHours += downtimeHours
      monthlyDowntime[month].maintenanceCount += 1
      monthlyDowntime[month].maintenanceCost += record.cost || 0
    })

    return {
      assetPerformance: assetPerformance.sort((a, b) => b.totalDowntimeHours - a.totalDowntimeHours),
      downtimeByCategory: Object.values(downtimeByCategory),
      monthlyTrends: Object.values(monthlyDowntime).sort((a, b) => a.month.localeCompare(b.month)),
      summary: {
        totalAssets: Object.keys(assetDowntimes).length,
        totalDowntimeHours: Object.values(assetDowntimes).reduce((sum, asset) => sum + asset.totalDowntimeHours, 0),
        totalMaintenanceCount: Object.values(assetDowntimes).reduce((sum, asset) => sum + asset.maintenanceCount, 0),
        totalMaintenanceCost: Object.values(assetDowntimes).reduce((sum, asset) => sum + asset.maintenanceCost, 0),
        averageAvailability:
          assetPerformance.length > 0
            ? (
                assetPerformance.reduce((sum, asset) => sum + Number.parseFloat(asset.availability), 0) /
                assetPerformance.length
              ).toFixed(2)
            : "0.00",
      },
    }
  }

  async getExpenseMaintenanceTrends(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear() - 1, 0, 1) // Default to start of previous year
    const end = endDate || new Date()

    // Get all maintenance records for the period
    const maintenanceRecords = await this.maintenanceRepository.find({
      where: {
        date: Between(start, end),
      },
      relations: ["asset"],
    })

    // Calculate monthly maintenance expenses
    const monthlyExpenses = {}
    maintenanceRecords.forEach((record) => {
      const month = new Date(record.date).toISOString().substring(0, 7) // YYYY-MM format

      if (!monthlyExpenses[month]) {
        monthlyExpenses[month] = {
          month,
          preventiveCost: 0,
          correctiveCost: 0,
          predictiveCost: 0,
          totalCost: 0,
          count: 0,
        }
      }

      const cost = record.cost || 0
      monthlyExpenses[month].totalCost += cost
      monthlyExpenses[month].count += 1

      // Categorize by maintenance type
      if (record.maintenanceType === "preventive") {
        monthlyExpenses[month].preventiveCost += cost
      } else if (record.maintenanceType === "corrective") {
        monthlyExpenses[month].correctiveCost += cost
      } else if (record.maintenanceType === "predictive") {
        monthlyExpenses[month].predictiveCost += cost
      }
    })

    // Calculate expenses by asset category
    const expensesByCategory = {}
    maintenanceRecords.forEach((record) => {
      if (!record.asset) return

      const category = record.asset.category
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = {
          category,
          preventiveCost: 0,
          correctiveCost: 0,
          predictiveCost: 0,
          totalCost: 0,
          count: 0,
        }
      }

      const cost = record.cost || 0
      expensesByCategory[category].totalCost += cost
      expensesByCategory[category].count += 1

      // Categorize by maintenance type
      if (record.maintenanceType === "preventive") {
        expensesByCategory[category].preventiveCost += cost
      } else if (record.maintenanceType === "corrective") {
        expensesByCategory[category].correctiveCost += cost
      } else if (record.maintenanceType === "predictive") {
        expensesByCategory[category].predictiveCost += cost
      }
    })

    // Calculate ROI of preventive vs. corrective maintenance
    const preventiveCost = maintenanceRecords
      .filter((record) => record.maintenanceType === "preventive")
      .reduce((sum, record) => sum + (record.cost || 0), 0)

    const correctiveCost = maintenanceRecords
      .filter((record) => record.maintenanceType === "corrective")
      .reduce((sum, record) => sum + (record.cost || 0), 0)

    // Calculate cost per asset
    const costPerAsset = {}
    maintenanceRecords.forEach((record) => {
      if (!record.asset) return

      const assetId = record.asset.id
      if (!costPerAsset[assetId]) {
        costPerAsset[assetId] = {
          assetId,
          assetName: record.asset.name,
          assetTag: record.asset.assetTag,
          category: record.asset.category,
          totalCost: 0,
          count: 0,
        }
      }

      costPerAsset[assetId].totalCost += record.cost || 0
      costPerAsset[assetId].count += 1
    })

    // Calculate cost vs. asset value ratio
    const costValueRatio = await Promise.all(
      Object.values(costPerAsset).map(async (asset: any) => {
        const assetData = await this.assetsRepository.findOne({
          where: { id: asset.assetId },
        })

        const assetValue = assetData?.purchasePrice || 0
        const ratio = assetValue > 0 ? (asset.totalCost / assetValue) * 100 : 0

        return {
          ...asset,
          assetValue,
          costValueRatio: ratio.toFixed(2),
        }
      }),
    )

    return {
      monthlyTrends: Object.values(monthlyExpenses).sort((a, b) => a.month.localeCompare(b.month)),
      expensesByCategory: Object.values(expensesByCategory),
      costPerAsset: costValueRatio.sort((a, b) => b.totalCost - a.totalCost),
      maintenanceROI: {
        preventiveCost,
        correctiveCost,
        totalCost: preventiveCost + correctiveCost,
        preventivePercentage:
          preventiveCost + correctiveCost > 0
            ? ((preventiveCost / (preventiveCost + correctiveCost)) * 100).toFixed(2)
            : "0.00",
        correctivePercentage:
          preventiveCost + correctiveCost > 0
            ? ((correctiveCost / (preventiveCost + correctiveCost)) * 100).toFixed(2)
            : "0.00",
      },
      summary: {
        totalExpenses: Object.values(monthlyExpenses).reduce((sum, month: any) => sum + month.totalCost, 0),
        averageMonthlyExpense:
          Object.values(monthlyExpenses).length > 0
            ? (
                Object.values(monthlyExpenses).reduce((sum, month: any) => sum + month.totalCost, 0) /
                Object.values(monthlyExpenses).length
              ).toFixed(2)
            : "0.00",
        highestExpenseMonth:
          Object.values(monthlyExpenses).sort((a: any, b: any) => b.totalCost - a.totalCost)[0] || null,
        highestExpenseCategory:
          Object.values(expensesByCategory).sort((a: any, b: any) => b.totalCost - a.totalCost)[0] || null,
      },
    }
  }
}
