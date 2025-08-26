import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional } from "class-validator";
import { ScheduleStatus } from "../entities/maintenance-schedule.entity/maintenance-schedule.entity";
import { CreateMaintenanceScheduleDto } from "./create-maintainance-schedule.dto";

export class UpdateMaintenanceScheduleDto extends PartialType(
  CreateMaintenanceScheduleDto
) {
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}
