import { ApiProperty } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator"
import { ApiKeyScope } from "../entities/api-key.entity"

export class QueryApiKeysDto {
  @ApiProperty({
    description: "Filter by API key name (partial match)",
    example: "production",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    description: "Filter by scope",
    example: ApiKeyScope.READ,
    enum: ApiKeyScope,
    required: false,
  })
  @IsOptional()
  @IsEnum(ApiKeyScope)
  scope?: ApiKeyScope

  @ApiProperty({
    description: "Filter by revoked status",
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  @IsBoolean()
  revoked?: boolean

  @ApiProperty({
    description: "Filter by expired status",
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value
  })
  @IsBoolean()
  expired?: boolean
}
