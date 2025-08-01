import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, MaxLength } from "class-validator"

export class RevokeApiKeyDto {
  @ApiProperty({
    description: "Reason for revoking the API key",
    example: "Security breach - key compromised",
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string
}
