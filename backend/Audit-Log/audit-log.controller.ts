import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { AuditLogResponseDto, AuditLogStatsDto } from './dto/audit-log-response.dto';
import { AuditLog, AuditAction, AuditResource } from './entities/audit-log.entity';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create audit log entry',
    description: 'Manually create an audit log entry (admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit log created successfully',
    type: AuditLog,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async create(@Body() createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    return this.auditLogService.create(createAuditLogDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve audit logs with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: AuditLogResponseDto,
  })
  async findAll(@Query() filterDto: FilterAuditLogDto): Promise<AuditLogResponseDto> {
    return this.auditLogService.findAll(filterDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: 'Get audit log statistics',
    description: 'Retrieve audit log statistics and analytics',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: AuditLogStatsDto,
  })
  async getStats(): Promise<AuditLogStatsDto> {
    return this.auditLogService.getStats();
  }

  @Get('resource/:resource/:resourceId')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: 'Get audit logs for a specific resource',
    description: 'Retrieve audit logs for a specific resource instance',
  })
  @ApiParam({
    name: 'resource',
    description: 'Resource type',
    enum: AuditResource,
  })
  @ApiParam({
    name: 'resourceId',
    description: 'Resource ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Resource audit logs retrieved successfully',
    type: [AuditLog],
  })
  async findByResource(
    @Param('resource') resource: AuditResource,
    @Param('resourceId') resourceId: string,
    @Query('limit') limit?: number,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByResource(resource, resourceId, limit);
  }

  @Get('actor/:actorId')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  @ApiOperation({
    summary: 'Get audit logs for a specific actor',
    description: 'Retrieve audit logs for a specific user/actor',
  })
  @ApiParam({
    name: 'actorId',
    description: 'Actor/User ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Actor audit logs retrieved successfully',
    type: [AuditLog],
  })
  async findByActor(
    @Param('actorId') actorId: string,
    @Query('limit') limit?: number,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByActor(actorId, limit);
  }

  @Get('my-logs')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD, UserRole.EMPLOYEE)
  @ApiOperation({
    summary: 'Get current user audit logs',
    description: 'Retrieve audit logs for the currently authenticated user',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully',
    type: [AuditLog],
  })
  async getMyLogs(
    @Request() req: any,
    @Query('limit') limit?: number,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByActor(req.user.id, limit);
  }
}
