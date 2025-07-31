import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum AuditAction {
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  ASSIGN = "ASSIGN",
  UNASSIGN = "UNASSIGN",
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  ARCHIVE = "ARCHIVE",
  RESTORE = "RESTORE",
  EXPORT = "EXPORT",
  IMPORT = "IMPORT",
}

export enum AuditResource {
  USER = "USER",
  ASSET = "ASSET",
  ROLE = "ROLE",
  PERMISSION = "PERMISSION",
  AUDIT_LOG = "AUDIT_LOG",
  ORGANIZATION_UNIT = "ORGANIZATION_UNIT",
  MOBILE_DEVICE = "MOBILE_DEVICE",
  POLICY_DOCUMENT = "POLICY_DOCUMENT",
  NOTIFICATION = "NOTIFICATION",
  REPORT = "REPORT",
  SYSTEM = "SYSTEM",
  API_KEY = "API_KEY",
}

@Entity("audit_logs")
@Index(["actorId", "timestamp"])
@Index(["resource", "timestamp"])
@Index(["action", "timestamp"])
@Index(["timestamp"])
export class AuditLog {
  @ApiProperty({
    description: "Unique identifier for the audit log entry",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "ID of the user who performed the action",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @Column()
  actorId: string;

  @ApiProperty({
    description: "Name or email of the actor for display purposes",
    example: "john.doe@example.com",
  })
  @Column()
  actorName: string;

  @ApiProperty({
    description: "The action that was performed",
    example: AuditAction.CREATE,
    enum: AuditAction,
  })
  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction;

  @ApiProperty({
    description: "The resource/entity type that was affected",
    example: AuditResource.ASSET,
    enum: AuditResource,
  })
  @Column({
    type: "enum",
    enum: AuditResource,
  })
  resource: AuditResource;

  @ApiProperty({
    description: "ID of the specific resource instance that was affected",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @Column({ nullable: true })
  resourceId?: string;

  @ApiProperty({
    description: "Human-readable description of the action",
    example: "Created new asset 'Laptop Dell XPS 13'",
  })
  @Column()
  description: string;

  @ApiProperty({
    description: "Additional details about the action in JSON format",
    example: {
      oldValues: { status: "active" },
      newValues: { status: "inactive" },
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0...",
    },
    required: false,
  })
  @Column("jsonb", { nullable: true })
  details?: Record<string, any>;

  @ApiProperty({
    description: "IP address from which the action was performed",
    example: "192.168.1.100",
    required: false,
  })
  @Column({ nullable: true })
  ipAddress?: string;

  @ApiProperty({
    description: "User agent string of the client",
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    required: false,
  })
  @Column({ nullable: true })
  userAgent?: string;

  @ApiProperty({
    description: "Session ID if applicable",
    example: "sess_123456789",
    required: false,
  })
  @Column({ nullable: true })
  sessionId?: string;

  @ApiProperty({
    description: "Request ID for tracing",
    example: "req_123456789",
    required: false,
  })
  @Column({ nullable: true })
  requestId?: string;

  @ApiProperty({
    description: "Whether the action was successful",
    example: true,
  })
  @Column({ default: true })
  success: boolean;

  @ApiProperty({
    description: "Error message if the action failed",
    example: "Validation failed: Name is required",
    required: false,
  })
  @Column({ nullable: true })
  errorMessage?: string;

  @ApiProperty({
    description: "Timestamp when the action was performed",
    example: "2024-01-15T10:30:00.000Z",
  })
  @CreateDateColumn()
  timestamp: Date;

  @ApiProperty({
    description: "Timestamp when the audit log was created",
    example: "2024-01-15T10:30:00.000Z",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "Timestamp when the audit log was last updated",
    example: "2024-01-15T10:30:00.000Z",
  })
  @UpdateDateColumn()
  updatedAt: Date;
}

