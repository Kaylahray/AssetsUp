import { IsUUID, IsDateString, IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsObject } from "class-validator"
import { AuditStatus, AssetCondition } from "../entities/asset-audit.entity"

export class CreateAssetAuditDto {
  @IsUUID()
  assetId: string

  @IsDateString()
  auditDate: string

  @IsString()
  auditedBy: string

  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition

  @IsString()
  @IsOptional()
  remarks?: string

  @IsObject()
  @IsOptional()
  findings?: Record<string, any>

  @IsNumber()
  @IsOptional()
  estimatedValue?: number

  @IsString()
  @IsOptional()
  location?: string

  @IsBoolean()
  @IsOptional()
  requiresAction?: boolean

  @IsString()
  @IsOptional()
  actionRequired?: string
}
