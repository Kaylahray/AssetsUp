import { IsEnum, IsString, IsOptional, IsDateString, IsNumber, IsUUID, Min } from "class-validator"
import { MaintenanceType } from "../entities/maintenance.entity"

export class CreateMaintenanceDto {
  @IsEnum(MaintenanceType)
  type: MaintenanceType

  @IsString()
  description: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number

  @IsDateString()
  startDate: string

  @IsDateString()
  dueDate: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number

  @IsUUID()
  assetId: string

  @IsOptional()
  @IsUUID()
  responsiblePersonId?: string

  @IsOptional()
  @IsUUID()
  vendorId?: string
}
