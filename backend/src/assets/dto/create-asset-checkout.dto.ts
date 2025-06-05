import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsDate, IsUUID, IsOptional, MaxLength } from "class-validator"
import { Type } from "class-transformer"

export class CreateAssetCheckoutDto {
  @ApiProperty({ description: "Asset ID", example: "550e8400-e29b-41d4-a716-446655440000" })
  @IsUUID()
  @IsNotEmpty()
  assetId: string

  @ApiProperty({ description: "Checkout date", example: "2023-06-15T10:00:00Z" })
  @Type(() => Date)
  @IsDate()
  checkoutDate: Date

  @ApiProperty({ description: "Due date", example: "2023-06-22T10:00:00Z" })
  @Type(() => Date)
  @IsDate()
  dueDate: Date

  @ApiPropertyOptional({ description: "Purpose of checkout", example: "Team presentation" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  purpose?: string

  @ApiPropertyOptional({ description: "Additional notes", example: "Will be used in the conference room" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string
}
