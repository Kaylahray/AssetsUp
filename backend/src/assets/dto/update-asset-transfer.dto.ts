import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsEnum, IsOptional, IsString, IsUUID, IsDate } from "class-validator"
import { Type } from "class-transformer"
import { TransferStatus } from "../entities/asset-transfer.entity"

export class UpdateAssetTransferDto {
  @ApiPropertyOptional({ enum: TransferStatus, example: TransferStatus.APPROVED })
  @IsEnum(TransferStatus)
  @IsOptional()
  status?: TransferStatus

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @IsOptional()
  approvedById?: string

  @ApiPropertyOptional({ example: "2023-02-15" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date

  @ApiPropertyOptional({ example: "Additional notes about the transfer" })
  @IsString()
  @IsOptional()
  notes?: string
}
