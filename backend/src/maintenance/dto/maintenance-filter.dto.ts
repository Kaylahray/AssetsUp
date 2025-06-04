import { IsOptional, IsEnum, IsDateString, IsUUID } from "class-validator"
import { MaintenanceType, MaintenanceStatus } from "../entities/maintenance.entity"

export class MaintenanceFilterDto {
  @IsOptional()
  @IsUUID()
  assetId?: string

  @IsOptional()
  @IsEnum(MaintenanceType)
  type?: MaintenanceType

  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsUUID()
  responsiblePersonId?: string

  @IsOptional()
  @IsUUID()
  vendorId?: string
}
