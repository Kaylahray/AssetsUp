import { ApiProperty } from "@nestjs/swagger";
import { AuditLog } from "../entities/audit-log.entity";

export class AuditLogResponseDto {
  @ApiProperty({
    description: "Array of audits log entries",
    type: [AuditLog],
  })
  data: AuditLog[];

  @ApiProperty({
    description: "Paginations and filterings metadata",
    example: {
      total: 150,
      limit: 20,
      offset: 0,
      page: 1,
      totalPages: 8,
      hasNext: true,
      hasPrevious: false,
    },
  })
  meta: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export class AuditLogStatsDto {
  @ApiProperty({
    description: "Total number of audit logs",
    example: 1500,
  })
  totalLogs: number;

  @ApiProperty({
    description: "Number of logs in the last 24 hours",
    example: 45,
  })
  logsLast24Hours: number;

  @ApiProperty({
    description: "Number of logs in the last 7 days",
    example: 320,
  })
  logsLast7Days: number;

  @ApiProperty({
    description: "Number of failed actions",
    example: 12,
  })
  failedActions: number;

  @ApiProperty({
    description: "Most active users",
    example: [
      { actorId: "user-1", actorName: "john.doe@example.com", count: 25 },
      { actorId: "user-2", actorName: "jane.smith@example.com", count: 18 },
    ],
  })
  mostActiveUsers: Array<{
    actorId: string;
    actorName: string;
    count: number;
  }>;

  @ApiProperty({
    description: "Most common actions",
    example: [
      { action: "READ", count: 450 },
      { action: "UPDATE", count: 230 },
      { action: "CREATE", count: 180 },
    ],
  })
  mostCommonActions: Array<{
    action: string;
    count: number;
  }>;

  @ApiProperty({
    description: "Most accessed resources",
    example: [
      { resource: "ASSET", count: 680 },
      { resource: "USER", count: 320 },
      { resource: "ROLE", count: 150 },
    ],
  })
  mostAccessedResources: Array<{
    resource: string;
    count: number;
  }>;
}
