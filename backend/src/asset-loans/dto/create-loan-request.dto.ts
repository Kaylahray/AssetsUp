import { ApiProperty } from "@nestjs/swagger"
import { IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from "class-validator"

export class CreateLoanRequestDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  borrowerId: string

  @ApiProperty({ example: "Laptop" })
  @IsString()
  @MaxLength(100)
  assetType: string

  @ApiProperty({ description: "ISO date string for due date", required: false })
  @IsOptional()
  @IsISO8601()
  returnDueDate?: string
}


