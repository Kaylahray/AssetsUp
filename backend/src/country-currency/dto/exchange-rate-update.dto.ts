import { IsNumber, IsOptional, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class ExchangeRateUpdateDto {
  @ApiProperty({ description: 'Exchange rate to USD', example: 1.25, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRateToUSD: number

  @ApiPropertyOptional({ description: 'Exchange rate update timestamp', example: '2024-01-10T14:30:00.000Z' })
  @IsOptional()
  exchangeRateUpdatedAt?: Date
}