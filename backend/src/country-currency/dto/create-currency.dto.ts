import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean, IsNumber, IsUUID, Min } from "class-validator"

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  code: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  symbol: string

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRateToUSD?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  decimalPlaces?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isBaseCurrency?: boolean

  @IsOptional()
  @IsUUID()
  countryId?: string
}
