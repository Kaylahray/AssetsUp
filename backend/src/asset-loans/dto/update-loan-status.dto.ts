import { ApiProperty } from "@nestjs/swagger"
import { IsEnum } from "class-validator"
import { LoanApprovalStatus } from "../entities/loan-request.entity"

export class UpdateLoanStatusDto {
  @ApiProperty({ enum: LoanApprovalStatus })
  @IsEnum(LoanApprovalStatus)
  status: LoanApprovalStatus
}


