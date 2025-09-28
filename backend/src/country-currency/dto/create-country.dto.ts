import { IsString, IsNotEmpty, Length, IsOptional, IsBoolean } from "class-validator"

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  isoCode2: string

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  isoCode3: string

  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  numericCode: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  region: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  subRegion: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
