import { ApiProperty } from "@nestjs/swagger"
import { ApiKeyScope } from "../entities/api-key.entity"

export class ApiKeyResponseDto {
  @ApiProperty({
    description: "Unique identifier for the API key",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id: string

  @ApiProperty({
    description: "Name of the API key",
    example: "Production API Key",
  })
  name: string

  @ApiProperty({
    description: "Description of the API key",
    example: "API key for production environment access",
    required: false,
  })
  description?: string

  @ApiProperty({
    description: "Owner ID of the API key",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  ownerId: string

  @ApiProperty({
    description: "Scopes/permissions for the API key",
    example: [ApiKeyScope.READ, ApiKeyScope.WRITE],
    enum: ApiKeyScope,
    isArray: true,
  })
  scopes: ApiKeyScope[]

  @ApiProperty({
    description: "Expiration date for the API key",
    example: "2024-12-31T23:59:59.999Z",
    required: false,
  })
  expirationDate?: Date

  @ApiProperty({
    description: "Whether the API key is revoked",
    example: false,
  })
  revoked: boolean

  @ApiProperty({
    description: "Date when the API key was revoked",
    example: "2024-01-15T10:30:00.000Z",
    required: false,
  })
  revokedAt?: Date

  @ApiProperty({
    description: "Reason for revoking the API key",
    example: "Security breach",
    required: false,
  })
  revokedReason?: string

  @ApiProperty({
    description: "Last time the API key was used",
    example: "2024-01-15T10:30:00.000Z",
    required: false,
  })
  lastUsedAt?: Date

  @ApiProperty({
    description: "Number of times the API key has been used",
    example: 42,
  })
  usageCount: number

  @ApiProperty({
    description: "Date when the API key was created",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt: Date

  @ApiProperty({
    description: "Date when the API key was last updated",
    example: "2024-01-15T10:30:00.000Z",
  })
  updatedAt: Date
}

export class CreateApiKeyResponseDto extends ApiKeyResponseDto {
  @ApiProperty({
    description: "The actual API key (only returned once during creation)",
    example: "ak_1234567890abcdef1234567890abcdef12345678",
  })
  key: string
}
