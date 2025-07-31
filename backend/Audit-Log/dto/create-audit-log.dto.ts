import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsIP,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction, AuditResource } from "../entities/audit-log.entity";

export class CreateAuditLogDto {
  @ApiProperty({
    description: "ID of the user who performed the action",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  actorId: string;

  @ApiProperty({
    description: "Name or email of the actor",
    example: "john.doe@example.com",
  })
  @IsString()
  actorName: string;

  @ApiProperty({
    description: "The action that was performed",
    example: AuditAction.CREATE,
    enum: AuditAction,
  })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({
    description: "The resource/entity type that was affected",
    example: AuditResource.ASSET,
    enum: AuditResource,
  })
  @IsEnum(AuditResource)
  resource: AuditResource;

  @ApiPropertyOptional({
    description: "ID of the specific resource instance",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiProperty({
    description: "Human-readable description of the action",
    example: "Created new asset 'Laptop Dell XPS 13'",
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: "Additional details about the action",
    example: {
      oldValues: { status: "active" },
      newValues: { status: "inactive" },
    },
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    description: "IP address from which the action was performed",
    example: "192.168.1.100",
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: "User agent string of the client",
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: "Session ID if applicable",
    example: "sess_123456789",
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: "Request ID for tracing",
    example: "req_123456789",
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({
    description: "Whether the action was successful",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({
    description: "Error message if the action failed",
    example: "Validation failed: Name is required",
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
