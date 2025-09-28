import { Controller, Get, Post, Patch, Delete } from "@nestjs/common"
import type { AssetAuditService } from "./asset-audit.service"
import type { CreateAssetAuditDto } from "./dto/create-asset-audit.dto"
import type { UpdateAssetAuditDto } from "./dto/update-asset-audit.dto"
import type { AuditReportQueryDto } from "./dto/audit-report.dto"
import type { AssetCondition } from "./entities/asset-audit.entity"

@Controller("asset-audits")
export class AssetAuditController {
  constructor(private readonly assetAuditService: AssetAuditService) {}

  @Post()
  create(createAssetAuditDto: CreateAssetAuditDto) {
    return this.assetAuditService.create(createAssetAuditDto)
  }

  @Get()
  findAll(page?: string, limit?: string) {
    const pageNum = page ? Number.parseInt(page, 10) : 1
    const limitNum = limit ? Number.parseInt(limit, 10) : 10
    return this.assetAuditService.findAll(pageNum, limitNum)
  }

  @Get("reports")
  generateReport(query: AuditReportQueryDto) {
    return this.assetAuditService.generateReport(query)
  }

  @Get("overdue")
  getOverdueAudits(daysPastDue?: string) {
    const days = daysPastDue ? Number.parseInt(daysPastDue, 10) : 30
    return this.assetAuditService.getOverdueAudits(days)
  }

  @Get("date-range")
  getAuditsByDateRange(startDate: string, endDate: string) {
    return this.assetAuditService.getAuditsByDateRange(startDate, endDate)
  }

  @Get("asset/:assetId")
  findByAsset(assetId: string) {
    return this.assetAuditService.findByAsset(assetId)
  }

  @Get(":id")
  findOne(id: string) {
    return this.assetAuditService.findOne(id)
  }

  @Patch(":id")
  update(id: string, updateAssetAuditDto: UpdateAssetAuditDto) {
    return this.assetAuditService.update(id, updateAssetAuditDto)
  }

  @Patch(":id/complete")
  completeAudit(id: string, condition: AssetCondition, remarks?: string) {
    return this.assetAuditService.completeAudit(id, condition, remarks)
  }

  @Delete(":id")
  remove(id: string) {
    return this.assetAuditService.remove(id)
  }
}
