import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { ChangeLogService } from './change-log.service';
import { CreateChangeLogDto, FilterChangeLogDto } from './dto/create-change-log.dto';
import { ChangeLog } from './entities/change-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Change Logs')
@Controller('change-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChangeLogController {
  constructor(private readonly changeLogService: ChangeLogService) {}

  @Post()
  @ApiOperation({ summary: 'Log a change made to any entity' })
  @ApiResponse({ status: 201, description: 'Change logged successfully', type: ChangeLog })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER)
  async logChange(@Body() createChangeLogDto: CreateChangeLogDto): Promise<ChangeLog> {
    return this.changeLogService.logChange(createChangeLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all change logs with optional filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of change logs with pagination', type: [ChangeLog] })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filter by entity type' })
  @ApiQuery({ name: 'entityId', required: false, description: 'Filter by entity ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  async findAll(@Query() filter: FilterChangeLogDto) {
    return this.changeLogService.findAll(filter);
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get change logs for a specific entity' })
  @ApiParam({ name: 'entityType', description: 'Type of entity (e.g., User, Asset)' })
  @ApiParam({ name: 'entityId', description: 'ID of the entity' })
  @ApiResponse({ status: 200, description: 'Change logs for the specified entity', type: [ChangeLog] })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  async findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<ChangeLog[]> {
    return this.changeLogService.findByEntity(entityType, entityId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get change logs made by a specific user' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiResponse({ status: 200, description: 'Change logs made by the specified user', type: [ChangeLog] })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  async findByUser(@Param('userId') userId: string): Promise<ChangeLog[]> {
    return this.changeLogService.findByUser(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get change logs within a date range' })
  @ApiQuery({ name: 'fromDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'toDate', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Change logs within the specified date range', type: [ChangeLog] })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  async findByDateRange(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
  ): Promise<ChangeLog[]> {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.changeLogService.findByDateRange(from, to);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get change log statistics' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to include in statistics', type: Number })
  @ApiResponse({ status: 200, description: 'Change log statistics' })
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.DEPARTMENT_HEAD)
  async getStatistics(@Query('days') days?: number) {
    return this.changeLogService.getStatistics(days ? parseInt(days.toString()) : 30);
  }

  @Post('generate-mock-data')
  @ApiOperation({ summary: 'Generate mock change log data for demonstration' })
  @ApiResponse({ status: 200, description: 'Mock data generated successfully' })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN)
  async generateMockData(): Promise<{ message: string }> {
    await this.changeLogService.generateMockChanges();
    return { message: 'Mock change log data generated successfully' };
  }
}