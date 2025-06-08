import { IsString, IsEnum, IsOptional, IsBoolean, IsObject } from "class-validator"
import { TaskType, TaskStatus } from "../entities/scheduled-task.entity"

export class CreateScheduledTaskDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsEnum(TaskType)
  type: TaskType

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @IsString()
  cronExpression: string

  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean
}
