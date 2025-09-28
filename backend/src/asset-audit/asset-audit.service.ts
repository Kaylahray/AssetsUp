import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { type Repository, Between, In } from "typeorm"
import { type AssetAudit, AuditStatus, AssetCondition } from "./entities/asset-audit.entity"
import type { CreateAssetAuditDto } from "./dto/create-asset-audit.dto"
import type { UpdateAssetAuditDto } from "./dto/update-asset-audit.dto"
import type { AuditReportQueryDto, AssetAuditReportDto, AuditSummaryDto } from "./dto/audit-report.dto"

@Injectable()
export class AssetAuditService {
  private readonly assetAuditRepository: Repository<AssetAudit>

  constructor(assetAuditRepository: Repository<AssetAudit>) {
    this.assetAuditRepository = assetAuditRepository
  }

  async create(createAssetAuditDto: CreateAssetAuditDto): Promise<AssetAudit> {
    // Check if there's already a pending audit for this asset
    const existingPendingAudit = await this.assetAuditRepository.findOne({
      where: {
        assetId: createAssetAuditDto.assetId,
        status: AuditStatus.PENDING,
      },
    })

    if (existingPendingAudit) {
      throw new BadRequestException("Asset already has a pending audit")
    }

    const audit = this.assetAuditRepository.create({
      ...createAssetAuditDto,
      auditDate: new Date(createAssetAuditDto.auditDate),
    })

    return await this.assetAuditRepository.save(audit)
  }

  async findAll(page = 1, limit = 10): Promise<{ data: AssetAudit[]; total: number }> {
    const [data, total] = await this.assetAuditRepository.findAndCount({
      order: { auditDate: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return { data, total }
  }

  async findOne(id: string): Promise<AssetAudit> {
    const audit = await this.assetAuditRepository.findOne({ where: { id } })
    if (!audit) {
      throw new NotFoundException(`Asset audit with ID ${id} not found`)
    }
    return audit
  }

  async findByAsset(assetId: string): Promise<AssetAudit[]> {
    return await this.assetAuditRepository.find({
      where: { assetId },
      order: { auditDate: "DESC" },
    })
  }

  async update(id: string, updateAssetAuditDto: UpdateAssetAuditDto): Promise<AssetAudit> {
    const audit = await this.findOne(id)

    if (updateAssetAuditDto.auditDate) {
      updateAssetAuditDto.auditDate = new Date(updateAssetAuditDto.auditDate) as any
    }

    Object.assign(audit, updateAssetAuditDto)
    return await this.assetAuditRepository.save(audit)
  }

  async remove(id: string): Promise<void> {
    const audit = await this.findOne(id)
    await this.assetAuditRepository.remove(audit)
  }

  async completeAudit(id: string, condition: AssetCondition, remarks?: string): Promise<AssetAudit> {
    const audit = await this.findOne(id)

    audit.status = AuditStatus.COMPLETED
    audit.condition = condition
    audit.remarks = remarks || audit.remarks
    audit.requiresAction =
      condition === AssetCondition.DAMAGED || condition === AssetCondition.POOR || condition === AssetCondition.MISSING

    return await this.assetAuditRepository.save(audit)
  }

  async generateReport(query: AuditReportQueryDto): Promise<AssetAuditReportDto> {
    const whereConditions: any = {}

    if (query.startDate && query.endDate) {
      whereConditions.auditDate = Between(new Date(query.startDate), new Date(query.endDate))
    }

    if (query.status) {
      whereConditions.status = query.status
    }

    if (query.condition) {
      whereConditions.condition = query.condition
    }

    if (query.auditedBy) {
      whereConditions.auditedBy = query.auditedBy
    }

    if (query.assetIds && query.assetIds.length > 0) {
      whereConditions.assetId = In(query.assetIds)
    }

    const audits = await this.assetAuditRepository.find({
      where: whereConditions,
      order: { auditDate: "DESC" },
    })

    // Generate summary
    const summary: AuditSummaryDto = {
      totalAudits: audits.length,
      completedAudits: audits.filter((a) => a.status === AuditStatus.COMPLETED).length,
      pendingAudits: audits.filter((a) => a.status === AuditStatus.PENDING).length,
      failedAudits: audits.filter((a) => a.status === AuditStatus.FAILED).length,
      assetsFound: audits.filter((a) => a.condition && a.condition !== AssetCondition.MISSING).length,
      assetsMissing: audits.filter((a) => a.condition === AssetCondition.MISSING).length,
      assetsRequiringAction: audits.filter((a) => a.requiresAction).length,
      auditCompletionRate:
        audits.length > 0 ? (audits.filter((a) => a.status === AuditStatus.COMPLETED).length / audits.length) * 100 : 0,
    }

    // Group by condition
    const auditsByCondition = audits.reduce(
      (acc, audit) => {
        if (audit.condition) {
          acc[audit.condition] = (acc[audit.condition] || 0) + 1
        }
        return acc
      },
      {} as Record<AssetCondition, number>,
    )

    // Group by status
    const auditsByStatus = audits.reduce(
      (acc, audit) => {
        acc[audit.status] = (acc[audit.status] || 0) + 1
        return acc
      },
      {} as Record<AuditStatus, number>,
    )

    // Get recent audits (last 10)
    const recentAudits = audits.slice(0, 10)

    // Get missing assets
    const missingAssets = audits.filter((a) => a.condition === AssetCondition.MISSING).map((a) => a.assetId)

    // Get assets requiring action
    const assetsRequiringAction = audits
      .filter((a) => a.requiresAction)
      .map((a) => ({
        assetId: a.assetId,
        condition: a.condition,
        actionRequired: a.actionRequired,
        auditDate: a.auditDate,
      }))

    return {
      summary,
      auditsByCondition,
      auditsByStatus,
      recentAudits,
      missingAssets,
      assetsRequiringAction,
    }
  }

  async getAuditsByDateRange(startDate: string, endDate: string): Promise<AssetAudit[]> {
    return await this.assetAuditRepository.find({
      where: {
        auditDate: Between(new Date(startDate), new Date(endDate)),
      },
      order: { auditDate: "DESC" },
    })
  }

  async getOverdueAudits(daysPastDue = 30): Promise<AssetAudit[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysPastDue)

    return await this.assetAuditRepository.find({
      where: {
        status: AuditStatus.PENDING,
        auditDate: Between(new Date("1900-01-01"), cutoffDate),
      },
      order: { auditDate: "ASC" },
    })
  }
}
