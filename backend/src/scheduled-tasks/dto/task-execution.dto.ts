import { IsEnum, IsOptional, IsString, IsObject, IsDateString } from "class-validator"
import { ExecutionStatus } from "../entities/task-execution.entity"

export class TaskExecutionDto {
  @IsEnum(ExecutionStatus)
  status: ExecutionStatus

  @IsDateString()
  startedAt: Date

  @IsOptional()
  @IsDateString()
  completedAt?: Date

  @IsOptional()
  @IsString()
  output?: string

  @IsOptional()
  @IsString()
  errorMessage?: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
