import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CheckoutStatus } from "../entities/asset-checkout.entity"
import type { AssetResponseDto } from "./asset-response.dto"

export class AssetCheckoutResponseDto {
  @ApiProperty({ description: "Checkout ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  id: string

  @ApiProperty({ description: "Asset ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  assetId: string

  @ApiPropertyOptional({ description: "Asset details" })
  asset?: AssetResponseDto

  @ApiProperty({ description: "User ID who checked out the asset", example: "550e8400-e29b-41d4-a716-446655440000" })
  checkedOutById: string

  @ApiPropertyOptional({ description: "User who checked out the asset" })
  checkedOutBy?: any

  @ApiProperty({ description: "Checkout date", example: "2023-06-15T10:00:00Z" })
  checkoutDate: Date

  @ApiProperty({ description: "Due date", example: "2023-06-22T10:00:00Z" })
  dueDate: Date

  @ApiPropertyOptional({ description: "Return date", example: "2023-06-20T15:30:00Z" })
  returnDate?: Date

  @ApiPropertyOptional({
    description: "User ID who checked in the asset",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  checkedInById?: string

  @ApiPropertyOptional({ description: "User who checked in the asset" })
  checkedInBy?: any

  @ApiProperty({ description: "Status", enum: CheckoutStatus, example: CheckoutStatus.ACTIVE })
  status: CheckoutStatus

  @ApiPropertyOptional({ description: "Purpose of checkout", example: "Team presentation" })
  purpose?: string

  @ApiPropertyOptional({ description: "Additional notes", example: "Will be used in the conference room" })
  notes?: string

  @ApiProperty({ description: "Created at", example: "2023-06-15T10:00:00Z" })
  createdAt: Date

  @ApiProperty({ description: "Updated at", example: "2023-06-15T10:00:00Z" })
  updatedAt: Date
}
