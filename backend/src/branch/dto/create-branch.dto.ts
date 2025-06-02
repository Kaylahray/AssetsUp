import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNumber,
  Length,
  Matches,
  IsObject,
  IsUUID,
  ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

class OperatingHoursDto {
  @ApiProperty({ description: "Opening time (HH:MM format)" })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Time must be in HH:MM format" })
  open: string

  @ApiProperty({ description: "Closing time (HH:MM format)" })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Time must be in HH:MM format" })
  close: string

  @ApiPropertyOptional({ description: "Is the branch closed on this day" })
  @IsOptional()
  @IsBoolean()
  closed?: boolean
}

export class CreateBranchDto {
  @ApiProperty({ description: "Branch name", maxLength: 100 })
  @IsString()
  @Length(1, 100)
  name: string

  @ApiProperty({ description: "Branch address", maxLength: 255 })
  @IsString()
  @Length(1, 255)
  address: string

  @ApiProperty({ description: "City", maxLength: 100 })
  @IsString()
  @Length(1, 100)
  city: string

  @ApiProperty({ description: "State/Province", maxLength: 100 })
  @IsString()
  @Length(1, 100)
  state: string

  @ApiProperty({ description: "Country", maxLength: 100 })
  @IsString()
  @Length(1, 100)
  country: string

  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string

  @ApiPropertyOptional({ description: "Email address" })
  @IsOptional()
  @IsEmail()
  @Length(1, 100)
  email?: string

  @ApiPropertyOptional({ description: "Branch description" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({ description: "Unique branch code", maxLength: 10 })
  @IsString()
  @Length(3, 10)
  @Matches(/^[A-Z0-9]+$/, { message: "Branch code must contain only uppercase letters and numbers" })
  branchCode: string

  @ApiPropertyOptional({ description: "Latitude coordinate" })
  @IsOptional()
  @IsNumber()
  latitude?: number

  @ApiPropertyOptional({ description: "Longitude coordinate" })
  @IsOptional()
  @IsNumber()
  longitude?: number

  @ApiPropertyOptional({ description: "Branch manager user ID" })
  @IsOptional()
  @IsUUID()
  managerId?: string

  @ApiPropertyOptional({ description: "Operating hours for each day of the week" })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: {
    monday?: OperatingHoursDto
    tuesday?: OperatingHoursDto
    wednesday?: OperatingHoursDto
    thursday?: OperatingHoursDto
    friday?: OperatingHoursDto
    saturday?: OperatingHoursDto
    sunday?: OperatingHoursDto
  }

  @ApiPropertyOptional({ description: "Branch timezone", default: "UTC" })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  timezone?: string = "UTC"

  @ApiPropertyOptional({ description: "Active status", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true
}
