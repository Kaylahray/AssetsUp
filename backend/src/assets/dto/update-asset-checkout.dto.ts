import { ApiPropertyOptional } from "@nestjs/swagger"
import { IsString, IsDate, IsEnum, IsOptional, MaxLength } from "class-validator"
import { Type } from "class-transformer"
import { CheckoutStatus } from "../entities/asset-checkout.entity"

export class UpdateAssetCheckoutDto {
  @ApiPropertyOptional({ description: "Due date", example: "2023-06-22T10:00:00Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date

  @ApiPropertyOptional({ description: "Return date", example: "2023-06-20T15:30:00Z" })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  returnDate?: Date

  @ApiPropertyOptional({ description: "Status", enum: CheckoutStatus })
  @IsOptional()
  @IsEnum(CheckoutStatus)
  status?: CheckoutStatus

  @ApiPropertyOptional({ description: "Additional notes", example: "Returned with all accessories" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string
}
