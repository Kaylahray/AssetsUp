import { IsString, IsNumber, IsOptional, Min, IsEnum, IsUUID } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export enum InventoryCategory {
  OFFICE_SUPPLIES = "office_supplies",
  ELECTRONICS = "electronics",
  TOOLS = "tools",
  FURNITURE = "furniture",
  CONSUMABLES = "consumables",
  PARTS = "parts",
  OTHER = "other",
}

export class CreateInventoryItemDto {
  @ApiProperty({ description: "Name of the inventory item" })
  @IsString()
  name: string

  @ApiProperty({ description: "SKU of the inventory item" })
  @IsString()
  sku: string

  @ApiPropertyOptional({ description: "Description of the inventory item" })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({ description: "Category of the inventory item", enum: InventoryCategory })
  @IsEnum(InventoryCategory)
  category: InventoryCategory

  @ApiProperty({ description: "Current quantity of the item" })
  @IsNumber()
  @Min(0)
  quantity: number

  @ApiProperty({ description: "Unit of measurement (e.g., pieces, boxes, kg)" })
  @IsString()
  unit: string

  @ApiProperty({ description: "Cost per unit" })
  @IsNumber()
  @Min(0)
  cost: number

  @ApiPropertyOptional({ description: "Reorder point (minimum quantity before reordering)" })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number

  @ApiPropertyOptional({ description: "Department that owns this inventory" })
  @IsString()
  @IsOptional()
  department?: string

  @ApiPropertyOptional({ description: "Location where the inventory is stored" })
  @IsString()
  @IsOptional()
  location?: string

  @ApiPropertyOptional({ description: "Supplier ID" })
  @IsUUID()
  @IsOptional()
  supplierId?: string

  @ApiPropertyOptional({ description: "Additional notes" })
  @IsString()
  @IsOptional()
  notes?: string
}
