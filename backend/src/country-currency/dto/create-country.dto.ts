import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateCountryDto {
  @ApiProperty({ description: 'Country name', example: 'United States', minLength: 1, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @ApiProperty({ description: '2-letter ISO country code', example: 'US', minLength: 2, maxLength: 2 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  isoCode2: string

  @ApiProperty({ description: '3-letter ISO country code', example: 'USA', minLength: 3, maxLength: 3 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  isoCode3: string

  @ApiProperty({ description: '3-digit numeric country code', example: '840', minLength: 3, maxLength: 3 })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  numericCode: string

  @ApiProperty({ description: 'Geographical region', example: 'Americas', minLength: 1, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  region: string

  @ApiProperty({ description: 'Geographical sub-region', example: 'Northern America', minLength: 1, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  subRegion: string

  @ApiPropertyOptional({ description: 'Country active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}