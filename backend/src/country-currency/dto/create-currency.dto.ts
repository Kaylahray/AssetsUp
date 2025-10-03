import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean, IsNumber, IsUUID, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateCurrencyDto {
  @ApiProperty({ description: '3-letter currency code', example: 'USD', minLength: 3, maxLength: 3 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  code: string

  @ApiProperty({ description: 'Currency name', example: 'US Dollar', minLength: 1, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @ApiProperty({ description: 'Currency symbol', example: '$', minLength: 1, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  symbol: string

  @ApiPropertyOptional({ description: 'Exchange rate to USD', example: 1.0, minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(0)
  exchangeRateToUSD?: number

  @ApiPropertyOptional({ description: 'Number of decimal places', example: 2, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  decimalPlaces?: number

  @ApiPropertyOptional({ description: 'Currency active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: 'Is base currency for system', example: false })
  @IsOptional()
  @IsBoolean()
  isBaseCurrency?: boolean

  @ApiPropertyOptional({ description: 'Associated country ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  countryId?: string
}