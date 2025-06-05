import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { InventoryCategory } from "./create-inventory-item.dto"

export class InventoryResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  sku: string

  @ApiPropertyOptional()
  description?: string

  @ApiProperty({ enum: InventoryCategory })
  category: InventoryCategory

  @ApiProperty()
  quantity: number

  @ApiProperty()
  unit: string

  @ApiProperty()
  cost: number

  @ApiProperty()
  reorderPoint: number

  @ApiPropertyOptional()
  department?: string

  @ApiPropertyOptional()
  location?: string

  @ApiPropertyOptional()
  supplierId?: string

  @ApiPropertyOptional()
  notes?: string

  @ApiProperty()
  isLowStock: boolean

  @ApiProperty()
  isOutOfStock: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
