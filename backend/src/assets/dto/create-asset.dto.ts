import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDate, IsUUID, IsArray } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty } from "@nestjs/swagger"
import { AssetCondition, AssetStatus } from "../entities/asset.entity"

export class CreateAssetDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serialNumber: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string

  @ApiProperty({ enum: AssetCondition, default: AssetCondition.NEW })
  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  location: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  purchaseDate: Date

  @ApiProperty()
  @IsNumber()
  purchasePrice: number

  @ApiProperty({ required: false })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  warrantyExpiration?: Date

  @ApiProperty({ enum: AssetStatus, default: AssetStatus.AVAILABLE })
  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  images?: string[]

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  documents?: string[]

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assetTag?: string

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assignedToId?: string

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string
}
