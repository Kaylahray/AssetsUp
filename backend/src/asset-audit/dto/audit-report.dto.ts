import { IsOptional, IsDateString, IsEnum, IsString, IsArray } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { AuditStatus, AssetCondition } from "../entities/asset-audit.entity"

export class AuditReportQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for audit report filter (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
    type: String
  })
  @IsDateString()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({
    description: 'End date for audit report filter (ISO 8601 format)',
    example: '2024-01-31T23:59:59.999Z',
    type: String
  })
  @IsDateString()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Filter by audit status',
    enum: AuditStatus,
    example: AuditStatus.COMPLETED
  })
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus

  @ApiPropertyOptional({
    description: 'Filter by asset condition',
    enum: AssetCondition,
    example: AssetCondition.GOOD
  })
  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition

  @ApiPropertyOptional({
    description: 'Filter by auditor name or ID',
    example: 'john.doe@company.com'
  })
  @IsString()
  @IsOptional()
  auditedBy?: string

  @ApiPropertyOptional({
    description: 'Filter by specific asset IDs',
    type: [String],
    example: ['asset-123', 'asset-456']
  })
  @IsArray()
  @IsOptional()
  assetIds?: string[]
}

export class AuditSummaryDto {
  @ApiProperty({
    description: 'Total number of audits conducted',
    example: 150
  })
  totalAudits: number

  @ApiProperty({
    description: 'Number of completed audits',
    example: 120
  })
  completedAudits: number

  @ApiProperty({
    description: 'Number of pending audits',
    example: 20
  })
  pendingAudits: number

  @ApiProperty({
    description: 'Number of failed audits',
    example: 10
  })
  failedAudits: number

  @ApiProperty({
    description: 'Number of assets found during audits',
    example: 145
  })
  assetsFound: number

  @ApiProperty({
    description: 'Number of assets missing during audits',
    example: 5
  })
  assetsMissing: number

  @ApiProperty({
    description: 'Number of assets requiring maintenance or action',
    example: 15
  })
  assetsRequiringAction: number

  @ApiProperty({
    description: 'Audit completion rate as percentage',
    example: 80.0,
    minimum: 0,
    maximum: 100
  })
  auditCompletionRate: number
}

export class AssetAuditReportDto {
  @ApiProperty({
    description: 'Summary statistics of the audit report',
    type: AuditSummaryDto
  })
  summary: AuditSummaryDto

  @ApiProperty({
    description: 'Breakdown of audits by asset condition',
    example: {
      [AssetCondition.EXCELLENT]: 50,
      [AssetCondition.GOOD]: 70,
      [AssetCondition.FAIR]: 20,
      [AssetCondition.POOR]: 8,
    }
  })
  auditsByCondition: Record<AssetCondition, number>

  @ApiProperty({
    description: 'Breakdown of audits by status',
    example: {
      [AuditStatus.PENDING]: 20,
      [AuditStatus.IN_PROGRESS]: 10,
      [AuditStatus.COMPLETED]: 120,
      [AuditStatus.FAILED]: 10
    }
  })
  auditsByStatus: Record<AuditStatus, number>

  @ApiProperty({
    description: 'List of recent audits with details',
    type: [Object],
    example: [
      {
        id: 'audit-123',
        assetId: 'asset-456',
        status: AuditStatus.COMPLETED,
        condition: AssetCondition.GOOD,
        auditedBy: 'john.doe@company.com',
        auditedAt: '2024-01-10T10:30:00.000Z'
      }
    ]
  })
  recentAudits: any[]

  @ApiProperty({
    description: 'List of missing asset IDs',
    type: [String],
    example: ['asset-789', 'asset-999']
  })
  missingAssets: string[]

  @ApiProperty({
    description: 'Assets requiring immediate attention or maintenance',
    type: [Object],
    example: [
      {
        assetId: 'asset-111',
        condition: AssetCondition.DAMAGED,
        issue: 'Requires immediate maintenance',
        lastAuditDate: '2024-01-10T10:30:00.000Z'
      }
    ]
  })
  assetsRequiringAction: any[]
}