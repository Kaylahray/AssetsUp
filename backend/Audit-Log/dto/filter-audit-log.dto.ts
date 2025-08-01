import { 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsUUID, 
  IsString, 
  IsBoolean,
  IsInt,
  Min,
  Max,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction, AuditResource } from "../entities/audit-log.entity";

export class FilterAuditLogDto {
  @ApiPropertyOptional({
    description: "Filter by actor ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    description: "Filter by actor name (partial match)",
    example: "john.doe",
  })
  @IsOptional()
  @IsString()
  actorName?: string;

  @ApiPropertyOptional({
    description: "Filter by action type",
    example: AuditAction.CREATE,
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: "Filter by resource type",
    example: AuditResource.ASSET,
    enum: AuditResource,
  })
  @IsOptional()
  @IsEnum(AuditResource)
  resource?: AuditResource;

  @ApiPropertyOptional({
    description: "Filter by specific resource ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "Filter by success status",
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional({
    description: "Filter from date (ISO string)",
    example: "2024-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: "Filter to date (ISO string)",
    example: "2024-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: "Search in description (partial match)",
    example: "asset creation",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Filter by IP address",
    example: "192.168.1.100",
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: "Filter by session ID",
    example: "sess_123456789",
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: "Number of records to return",
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "Number of records to skip",
    example: 0,
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: "Sort field",
    example: "timestamp",
    enum: ["timestamp", "action", "resource", "actorName"],
    default: "timestamp",
  })
  @IsOptional()
  @IsString()
  sortBy?: string = "timestamp";

  @ApiPropertyOptional({
    description: "Sort order",
    example: "DESC",
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC";
}
