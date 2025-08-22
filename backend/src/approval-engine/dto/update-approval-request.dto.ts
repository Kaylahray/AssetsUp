import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { ApprovalStatus } from "../entities/approval-request.entity"

export class UpdateApprovalRequestDto {
  @ApiProperty({ enum: ApprovalStatus })
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus

  @ApiProperty({ example: "reviewer@example.com" })
  @IsString()
  @IsNotEmpty()
  reviewedBy: string

  @ApiPropertyOptional({ example: "Approved after reviewing asset condition" })
  @IsOptional()
  @IsString()
  comments?: string
}
