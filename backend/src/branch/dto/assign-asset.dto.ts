import { IsUUID, IsArray, ArrayNotEmpty, IsOptional, IsString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class AssignAssetDto {
  @ApiProperty({ description: "Array of asset IDs to assign", type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  assetIds: string[]

  @ApiPropertyOptional({ description: "Notes for the assignment" })
  @IsOptional()
  @IsString()
  notes?: string
}

export class TransferAssetDto {
  @ApiProperty({ description: "Target branch ID" })
  @IsUUID()
  targetBranchId: string

  @ApiProperty({ description: "Array of asset IDs to transfer", type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  assetIds: string[]

  @ApiPropertyOptional({ description: "Reason for transfer" })
  @IsOptional()
  @IsString()
  transferReason?: string

  @ApiPropertyOptional({ description: "Additional notes" })
  @IsOptional()
  @IsString()
  notes?: string
}

export class AssignInventoryDto {
  @ApiProperty({ description: "Array of inventory IDs to assign", type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  inventoryIds: string[]

  @ApiPropertyOptional({ description: "Notes for the assignment" })
  @IsOptional()
  @IsString()
  notes?: string
}
