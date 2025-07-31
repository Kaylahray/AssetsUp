import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { ApiKeyScope } from "../entities/api-key.entity"

export class UpdateApiKeyDto {
  @ApiProperty({
    description: "Name for the API key",
    example: "Updated Production API Key",
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string

  @ApiProperty({
    description: "Optional description for the API key",
    example: "Updated API key for production environment access",
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiProperty({
    description: "Scopes/permissions for the API key",
    example: [ApiKeyScope.READ, ApiKeyScope.WRITE],
    enum: ApiKeyScope,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ApiKeyScope, { each: true })
  scopes?: ApiKeyScope[]

  @ApiProperty({
    description: "Expiration date for the API key (ISO string)",
    example: "2024-12-31T23:59:59.999Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string
}
