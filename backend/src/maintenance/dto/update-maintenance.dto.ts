import { PartialType } from "@nestjs/mapped-types"
import { CreateMaintenanceDto } from "./create-maintenance.dto"
import { IsEnum, IsOptional, IsDateString, IsNumber, Min } from "class-validator"
import { MaintenanceStatus } from "../entities/maintenance.entity"

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus

  @IsOptional()
  @IsDateString()
  completionDate?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number
}
