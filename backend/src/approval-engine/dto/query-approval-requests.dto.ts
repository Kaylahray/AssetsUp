import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from "class-validator"
import { ApprovalActionType, ApprovalStatus } from "../entities/approval-request.entity"

export class QueryApprovalRequestsDto {
  @ApiPropertyOptional({ enum: ApprovalActionType })
  @IsOptional()
  @IsEnum(ApprovalActionType)
  actionType?: ApprovalActionType

  @ApiPropertyOptional({ example: "asset" })
  @IsOptional()
  @IsString()
  resourceType?: string

  @ApiPropertyOptional({ example: "ASSET-123" })
  @IsOptional()
  @IsString()
  resourceId?: string

  @ApiPropertyOptional({ enum: ApprovalStatus })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus

  @ApiPropertyOptional({ example: "user@example.com" })
  @IsOptional()
  @IsString()
  requestedBy?: string

  @ApiPropertyOptional({ example: "reviewer@example.com" })
  @IsOptional()
  @IsString()
  reviewedBy?: string

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10
}
