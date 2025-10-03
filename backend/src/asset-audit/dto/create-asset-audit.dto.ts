import { IsUUID, IsDateString, IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsObject } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { AuditStatus, AssetCondition } from "../entities/asset-audit.entity"

export class CreateAssetAuditDto {
  @ApiProperty({
    description: 'UUID of the asset being audited',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @IsUUID()
  assetId: string

  @ApiProperty({
    description: 'Date and time when the audit was conducted (ISO 8601 format)',
    example: '2024-01-10T14:30:00.000Z',
    type: String
  })
  @IsDateString()
  auditDate: string

  @ApiProperty({
    description: 'Name or identifier of the person conducting the audit',
    example: 'john.doe@company.com'
  })
  @IsString()
  auditedBy: string

  @ApiPropertyOptional({
    description: 'Current status of the audit',
    enum: AuditStatus,
    example: AuditStatus.IN_PROGRESS
  })
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus

  @ApiPropertyOptional({
    description: 'Condition of the asset during audit',
    enum: AssetCondition,
    example: AssetCondition.GOOD
  })
  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition

  @ApiPropertyOptional({
    description: 'Additional comments or notes about the audit',
    example: 'Asset found in good condition with minor wear and tear'
  })
  @IsString()
  @IsOptional()
  remarks?: string

  @ApiPropertyOptional({
    description: 'Detailed findings from the audit as key-value pairs',
    example: {
      'physical_damage': 'Minor scratches on surface',
      'functional_check': 'All systems operational',
      'safety_issues': 'None identified',
      'maintenance_needed': 'Routine cleaning required'
    },
    type: 'object'
  })
  @IsObject()
  @IsOptional()
  findings?: Record<string, any>

  @ApiPropertyOptional({
    description: 'Estimated current value of the asset in USD',
    example: 15000.50,
    minimum: 0
  })
  @IsNumber()
  @IsOptional()
  estimatedValue?: number

  @ApiPropertyOptional({
    description: 'Current location of the asset during audit',
    example: 'Warehouse A, Shelf 5B'
  })
  @IsString()
  @IsOptional()
  location?: string

  @ApiPropertyOptional({
    description: 'Flag indicating if the asset requires any action',
    example: false
  })
  @IsBoolean()
  @IsOptional()
  requiresAction?: boolean

  @ApiPropertyOptional({
    description: 'Description of required actions if applicable',
    example: 'Schedule maintenance within 30 days'
  })
  @IsString()
  @IsOptional()
  actionRequired?: string
}