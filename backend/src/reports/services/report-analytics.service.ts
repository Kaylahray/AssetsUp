import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Asset } from "../../assets/entities/asset.entity"
import type { MaintenanceRecord } from "../../maintenance/entities/maintenance-record.entity"
import type { AssetTransfer } from "../../assets/entities/asset-transfer.entity"
import type { AssetCheckout } from "../../assets/entities/asset-checkout.entity"

@Injectable()
export class ReportAnalyticsService {
  constructor(
    private assetRepository: Repository<Asset>,
    private maintenanceRepository: Repository<MaintenanceRecord>,
    private transferRepository: Repository<AssetTransfer>,
    private checkoutRepository: Repository<AssetCheckout>,
  ) {}

  async getAssetUtilizationAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1)
    const end = endDate || new Date()

    // Calculate asset utilization rates
    const totalAssets = await this.assetRepository.count()
    const assignedAssets = await this.assetRepository.count({
      where: { status: "assigned" },
    })

    const utilizationRate = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0

    // Get checkout frequency
    const checkoutFrequency = await this.checkoutRepository
      .createQueryBuilder("checkout")
      .select("checkout.assetId", "assetId")
      .addSelect("COUNT(*)", "checkoutCount")
      .where("checkout.checkoutDate BETWEEN :start AND :end", { start, end })
      .groupBy("checkout.assetId")
      .orderBy("checkoutCount", "DESC")
      .limit(20)
      .getRawMany()

    // Get idle assets (never checked out or assigned)
    const idleAssets = await this.assetRepository
      .createQueryBuilder("asset")
      .leftJoin("asset.checkouts", "checkout")
      .leftJoin("asset.transfers", "transfer")
      .where("checkout.id IS NULL")
      .andWhere("transfer.id IS NULL")
      .andWhere("asset.status = :status", { status: "available" })
      .getMany()

    // Calculate average checkout duration
    const avgCheckoutDuration = await this.checkoutRepository
      .createQueryBuilder("checkout")
      .select("AVG(EXTRACT(EPOCH FROM (checkout.returnDate - checkout.checkoutDate))/3600)", "avgHours")
      .where("checkout.returnDate IS NOT NULL")
      .andWhere("checkout.checkoutDate BETWEEN :start AND :end", { start, end })
      .getRawOne()

    return {
      utilizationRate: Number.parseFloat(utilizationRate.toFixed(2)),
      totalAssets,
      assignedAssets,
      idleAssets: idleAssets.length,
      checkoutFrequency,
      averageCheckoutDuration: Number.parseFloat(avgCheckoutDuration?.avgHours || "0"),
      idleAssetsList: idleAssets.slice(0, 10), // Top 10 idle assets
    }
  }

  async getMaintenanceEfficiencyAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1)
    const end = endDate || new Date()

    // Calculate maintenance completion rates
    const totalMaintenance = await this.maintenanceRepository.count({
      where: {
        date: { $gte: start, $lte: end } as any,
      },
    })

    const completedMaintenance = await this.maintenanceRepository.count({
      where: {
        date: { $gte: start, $lte: end } as any,
        status: "completed",
      },
    })

    const completionRate = totalMaintenance > 0 ? (completedMaintenance / totalMaintenance) * 100 : 0

    // Calculate average time to complete maintenance
    const avgCompletionTime = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("AVG(EXTRACT(EPOCH FROM (maintenance.completedDate - maintenance.date))/3600)", "avgHours")
      .where("maintenance.completedDate IS NOT NULL")
      .andWhere("maintenance.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    // Get maintenance by type efficiency
    const maintenanceByType = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("maintenance.maintenanceType", "type")
      .addSelect("COUNT(*)", "total")
      .addSelect("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)", "completed")
      .addSelect("AVG(maintenance.cost)", "avgCost")
      .where("maintenance.date BETWEEN :start AND :end", { start, end })
      .groupBy("maintenance.maintenanceType")
      .getRawMany()

    // Calculate preventive vs corrective maintenance ratio
    const preventiveMaintenance = await this.maintenanceRepository.count({
      where: {
        date: { $gte: start, $lte: end } as any,
        maintenanceType: "preventive",
      },
    })

    const correctiveMaintenance = await this.maintenanceRepository.count({
      where: {
        date: { $gte: start, $lte: end } as any,
        maintenanceType: "corrective",
      },
    })

    return {
      completionRate: Number.parseFloat(completionRate.toFixed(2)),
      totalMaintenance,
      completedMaintenance,
      averageCompletionTime: Number.parseFloat(avgCompletionTime?.avgHours || "0"),
      maintenanceByType: maintenanceByType.map((item) => ({
        type: item.type,
        total: Number.parseInt(item.total),
        completed: Number.parseInt(item.completed),
        completionRate: item.total > 0 ? (item.completed / item.total) * 100 : 0,
        avgCost: Number.parseFloat(item.avgCost || "0"),
      })),
      preventiveVsCorrective: {
        preventive: preventiveMaintenance,
        corrective: correctiveMaintenance,
        ratio: correctiveMaintenance > 0 ? preventiveMaintenance / correctiveMaintenance : 0,
      },
    }
  }

  async getCostAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1)
    const end = endDate || new Date()

    // Total asset value
    const totalAssetValue = await this.assetRepository
      .createQueryBuilder("asset")
      .select("SUM(CAST(asset.purchasePrice AS DECIMAL))", "total")
      .getRawOne()

    // Maintenance costs
    const maintenanceCosts = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("SUM(CAST(maintenance.cost AS DECIMAL))", "total")
      .where("maintenance.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    // Cost per asset category
    const costByCategory = await this.assetRepository
      .createQueryBuilder("asset")
      .select("asset.category", "category")
      .addSelect("SUM(CAST(asset.purchasePrice AS DECIMAL))", "totalValue")
      .addSelect("COUNT(*)", "count")
      .addSelect("AVG(CAST(asset.purchasePrice AS DECIMAL))", "avgValue")
      .groupBy("asset.category")
      .getRawMany()

    // Monthly cost trends
    const monthlyCosts = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("DATE_TRUNC('month', maintenance.date)", "month")
      .addSelect("SUM(CAST(maintenance.cost AS DECIMAL))", "totalCost")
      .addSelect("COUNT(*)", "count")
      .where("maintenance.date BETWEEN :start AND :end", { start, end })
      .groupBy("DATE_TRUNC('month', maintenance.date)")
      .orderBy("month", "ASC")
      .getRawMany()

    // Cost efficiency metrics
    const costPerAsset = totalAssetValue?.total > 0 ? (maintenanceCosts?.total || 0) / totalAssetValue.total : 0
    const costPerMaintenance = await this.maintenanceRepository
      .createQueryBuilder("maintenance")
      .select("AVG(CAST(maintenance.cost AS DECIMAL))", "avg")
      .where("maintenance.date BETWEEN :start AND :end", { start, end })
      .getRawOne()

    return {
      totalAssetValue: Number.parseFloat(totalAssetValue?.total || "0"),
      totalMaintenanceCosts: Number.parseFloat(maintenanceCosts?.total || "0"),
      costPerAssetRatio: Number.parseFloat((costPerAsset * 100).toFixed(2)),
      averageMaintenanceCost: Number.parseFloat(costPerMaintenance?.avg || "0"),
      costByCategory: costByCategory.map((item) => ({
        category: item.category,
        totalValue: Number.parseFloat(item.totalValue || "0"),
        count: Number.parseInt(item.count),
        avgValue: Number.parseFloat(item.avgValue || "0"),
      })),
      monthlyCostTrends: monthlyCosts.map((item) => ({
        month: item.month,
        totalCost: Number.parseFloat(item.totalCost || "0"),
        count: Number.parseInt(item.count),
      })),
    }
  }

  async getTransferAnalytics(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(new Date().getFullYear(), 0, 1)
    const end = endDate || new Date()

    // Transfer volume
    const totalTransfers = await this.transferRepository.count({
      where: {
        transferDate: { $gte: start, $lte: end } as any,
      },
    })

    // Transfer by type
    const transfersByType = await this.transferRepository
      .createQueryBuilder("transfer")
      .select("transfer.transferType", "type")
      .addSelect("COUNT(*)", "count")
      .where("transfer.transferDate BETWEEN :start AND :end", { start, end })
      .groupBy("transfer.transferType")
      .getRawMany()

    // Transfer by department
    const transfersByDepartment = await this.transferRepository
      .createQueryBuilder("transfer")
      .select("transfer.toDepartment", "department")
      .addSelect("COUNT(*)", "count")
      .where("transfer.transferDate BETWEEN :start AND :end", { start, end })
      .andWhere("transfer.toDepartment IS NOT NULL")
      .groupBy("transfer.toDepartment")
      .getRawMany()

    // Average transfer approval time
    const avgApprovalTime = await this.transferRepository
      .createQueryBuilder("transfer")
      .select("AVG(EXTRACT(EPOCH FROM (transfer.approvedDate - transfer.requestDate))/3600)", "avgHours")
      .where("transfer.approvedDate IS NOT NULL")
      .andWhere("transfer.transferDate BETWEEN :start AND :end", { start, end })
      .getRawOne()

    // Transfer success rate
    const approvedTransfers = await this.transferRepository.count({
      where: {
        transferDate: { $gte: start, $lte: end } as any,
        status: "approved",
      },
    })

    const successRate = totalTransfers > 0 ? (approvedTransfers / totalTransfers) * 100 : 0

    return {
      totalTransfers,
      successRate: Number.parseFloat(successRate.toFixed(2)),
      averageApprovalTime: Number.parseFloat(avgApprovalTime?.avgHours || "0"),
      transfersByType: transfersByType.map((item) => ({
        type: item.type,
        count: Number.parseInt(item.count),
      })),
      transfersByDepartment: transfersByDepartment.map((item) => ({
        department: item.department,
        count: Number.parseInt(item.count),
      })),
    }
  }
}
