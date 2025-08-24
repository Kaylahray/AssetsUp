import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApprovalActionType } from "../entities/approval-request.entity"

export class CreateApprovalRequestDto {
  @ApiProperty({ enum: ApprovalActionType })
  @IsEnum(ApprovalActionType)
  actionType: ApprovalActionType

  @ApiProperty({ example: "ASSET-123" })
  @IsString()
  @IsNotEmpty()
  resourceId: string

  @ApiProperty({ example: "asset" })
  @IsString()
  @IsNotEmpty()
  resourceType: string

  @ApiProperty({ example: "user@example.com" })
  @IsString()
  @IsNotEmpty()
  requestedBy: string

  @ApiPropertyOptional({ example: "Asset disposal request for end-of-life equipment" })
  @IsOptional()
  @IsString()
  requestReason?: string
}
