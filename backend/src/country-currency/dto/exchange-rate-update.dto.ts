import { IsNumber, IsOptional, Min } from "class-validator"

export class ExchangeRateUpdateDto {
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRateToUSD: number

  @IsOptional()
  exchangeRateUpdatedAt?: Date
}
