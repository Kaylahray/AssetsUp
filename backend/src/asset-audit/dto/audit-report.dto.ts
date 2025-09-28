import { IsOptional, IsDateString, IsEnum, IsString, IsArray } from "class-validator"
import { AuditStatus, AssetCondition } from "../entities/asset-audit.entity"

export class AuditReportQueryDto {
  @IsDateString()
  @IsOptional()
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition

  @IsString()
  @IsOptional()
  auditedBy?: string

  @IsArray()
  @IsOptional()
  assetIds?: string[]
}

export class AuditSummaryDto {
  totalAudits: number
  completedAudits: number
  pendingAudits: number
  failedAudits: number
  assetsFound: number
  assetsMissing: number
  assetsRequiringAction: number
  auditCompletionRate: number
}

export class AssetAuditReportDto {
  summary: AuditSummaryDto
  auditsByCondition: Record<AssetCondition, number>
  auditsByStatus: Record<AuditStatus, number>
  recentAudits: any[]
  missingAssets: string[]
  assetsRequiringAction: any[]
}
