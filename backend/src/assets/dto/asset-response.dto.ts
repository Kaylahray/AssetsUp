import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { AssetCondition, AssetStatus } from "../entities/asset.entity"
import { Type } from "class-transformer"

class UserDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: "John Doe" })
  name: string

  @ApiProperty({ example: "john.doe@example.com" })
  email: string
}

export class AssetResponseDto {
  @ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ example: 'MacBook Pro 16"' })
  name: string

  @ApiProperty({ example: "Laptop" })
  type: string

  @ApiProperty({ example: "C02E839AJGH7" })
  serialNumber: string

  @ApiProperty({ example: "Electronics" })
  category: string

  @ApiProperty({ enum: AssetCondition, example: AssetCondition.NEW })
  condition: AssetCondition

  @ApiProperty({ example: "Headquarters - Floor 3" })
  location: string

  @ApiProperty({ example: "Engineering" })
  department: string

  @ApiProperty({ example: "2023-01-15T00:00:00.000Z" })
  purchaseDate: Date

  @ApiProperty({ example: 2499.99 })
  purchasePrice: number

  @ApiPropertyOptional({ example: "2025-01-15T00:00:00.000Z" })
  warrantyExpiration?: Date

  @ApiPropertyOptional()
  @Type(() => UserDto)
  assignedTo?: UserDto

  @ApiPropertyOptional({ example: "550e8400-e29b-41d4-a716-446655440000" })
  assignedToId?: string

  @ApiProperty({ enum: AssetStatus, example: AssetStatus.AVAILABLE })
  status: AssetStatus

  @ApiPropertyOptional({ example: "Includes carrying case and charger" })
  notes?: string

  @ApiPropertyOptional({ type: [String], example: ["asset1.jpg", "asset2.jpg"] })
  images?: string[]

  @ApiPropertyOptional({ type: [String], example: ["manual.pdf", "receipt.pdf"] })
  documents?: string[]

  @ApiPropertyOptional({ example: "qr-code-asset-123.png" })
  qrCode?: string

  @ApiPropertyOptional({ example: "ASSET-2023-001" })
  assetTag?: string

  @ApiPropertyOptional({ example: "0x123abc..." })
  onChainId?: string

  @ApiProperty({ example: "2023-01-15T12:00:00.000Z" })
  createdAt: Date

  @ApiProperty({ example: "2023-01-15T12:00:00.000Z" })
  updatedAt: Date
}
