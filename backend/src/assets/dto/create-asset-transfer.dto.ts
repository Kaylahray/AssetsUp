import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDate } from "class-validator"
import { Type } from "class-transformer"
import { TransferType } from "../entities/asset-transfer.entity"

export class CreateAssetTransferDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @IsNotEmpty()
  assetId: string

  @ApiProperty({ enum: TransferType, example: TransferType.USER_TO_USER })
  @IsEnum(TransferType)
  @IsNotEmpty()
  transferType: TransferType

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @IsOptional()
  fromUserId?: string

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @IsOptional()
  toUserId?: string

  @ApiPropertyOptional({ example: "Engineering" })
  @IsString()
  @IsOptional()
  fromDepartment?: string

  @ApiPropertyOptional({ example: "Marketing" })
  @IsString()
  @IsOptional()
  toDepartment?: string

  @ApiProperty({ example: "2023-01-15" })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  transferDate: Date

  @ApiPropertyOptional({ example: "2023-02-15" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date

  @ApiPropertyOptional({ example: "Employee is changing departments" })
  @IsString()
  @IsOptional()
  reason?: string

  @ApiPropertyOptional({ example: "Additional notes about the transfer" })
  @IsString()
  @IsOptional()
  notes?: string
}
