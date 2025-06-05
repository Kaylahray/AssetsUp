import { IsString, IsNumber, IsOptional, Min, IsEnum, IsUUID, IsDate } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"

export enum StockTransactionType {
  STOCK_IN = "stock_in",
  STOCK_OUT = "stock_out",
  ADJUSTMENT = "adjustment",
  RETURN = "return",
  DAMAGE = "damage",
  EXPIRED = "expired",
}

export class CreateStockTransactionDto {
  @ApiProperty({ description: "Inventory item ID" })
  @IsUUID()
  inventoryItemId: string

  @ApiProperty({ description: "Type of transaction", enum: StockTransactionType })
  @IsEnum(StockTransactionType)
  type: StockTransactionType

  @ApiProperty({ description: "Quantity affected by the transaction" })
  @IsNumber()
  @Min(0)
  quantity: number

  @ApiPropertyOptional({ description: "Reference number (e.g., PO number, invoice number)" })
  @IsString()
  @IsOptional()
  referenceNumber?: string

  @ApiPropertyOptional({ description: "Person who requested the transaction" })
  @IsString()
  @IsOptional()
  requestedBy?: string

  @ApiPropertyOptional({ description: "Reason for the transaction" })
  @IsString()
  @IsOptional()
  reason?: string

  @ApiPropertyOptional({ description: "Transaction date" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  transactionDate?: Date
}

export class StockTransactionResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  inventoryItemId: string

  @ApiProperty({ enum: StockTransactionType })
  type: StockTransactionType

  @ApiProperty()
  quantity: number

  @ApiProperty()
  quantityBefore: number

  @ApiProperty()
  quantityAfter: number

  @ApiPropertyOptional()
  referenceNumber?: string

  @ApiPropertyOptional()
  requestedBy?: string

  @ApiPropertyOptional()
  reason?: string

  @ApiProperty()
  performedById?: string

  @ApiPropertyOptional()
  onChainId?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
