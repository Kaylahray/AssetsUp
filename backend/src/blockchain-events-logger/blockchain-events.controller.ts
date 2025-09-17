import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BlockchainEventsService } from './blockchain-events.service';
import { CreateBlockchainEventDto } from './dto/create-blockchain-event.dto';
import { UpdateBlockchainEventDto } from './dto/update-blockchain-event.dto';
import { BlockchainEventsQueryDto } from './dto/blockchain-events-query.dto';
import { StarkNetMockPayloadDto } from './dto/starknet-mock-payload.dto';
import { BlockchainEvent } from './entities/blockchain-event.entity';
import { BlockchainEventType } from './blockchain-events.enums';

@ApiTags('Blockchain Events Logger')
@Controller('blockchain-events')
export class BlockchainEventsController {
  constructor(private readonly blockchainEventsService: BlockchainEventsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new blockchain event',
    description: 'Creates a new blockchain event record with transaction details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blockchain event created successfully',
    type: BlockchainEvent,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Transaction hash already exists',
  })
  async create(@Body() createBlockchainEventDto: CreateBlockchainEventDto): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.create(createBlockchainEventDto);
  }

  @Post('starknet-payload')
  @ApiOperation({
    summary: 'Create blockchain event from StarkNet payload',
    description: 'Processes a mock StarkNet transaction receipt and creates a blockchain event',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Blockchain event created from StarkNet payload',
    type: BlockchainEvent,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid StarkNet payload',
  })
  async createFromStarkNetPayload(@Body() payload: StarkNetMockPayloadDto): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.createFromStarkNetPayload(payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all blockchain events',
    description: 'Retrieves blockchain events with filtering, pagination, and analytics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain events retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          items: { $ref: '#/components/schemas/BlockchainEvent' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        analytics: { type: 'object' },
      },
    },
  })
  async findAll(@Query() query: BlockchainEventsQueryDto) {
    return await this.blockchainEventsService.findAll(query);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get blockchain events analytics',
    description: 'Retrieves comprehensive analytics for blockchain events',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
  })
  async getAnalytics(@Query() filters: Partial<BlockchainEventsQueryDto>) {
    return await this.blockchainEventsService.getAnalytics(filters);
  }

  @Get('asset/:assetId')
  @ApiOperation({
    summary: 'Get blockchain events by asset ID',
    description: 'Retrieves all blockchain events associated with a specific asset',
  })
  @ApiParam({
    name: 'assetId',
    description: 'Asset ID to filter events',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'eventType',
    required: false,
    enum: BlockchainEventType,
    description: 'Filter by event type',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of events to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset blockchain events retrieved successfully',
    type: [BlockchainEvent],
  })
  async findByAssetId(
    @Param('assetId', ParseUUIDPipe) assetId: string,
    @Query() query: Partial<BlockchainEventsQueryDto>,
  ): Promise<BlockchainEvent[]> {
    return await this.blockchainEventsService.findByAssetId(assetId, query);
  }

  @Get('event-type/:eventType')
  @ApiOperation({
    summary: 'Get blockchain events by event type',
    description: 'Retrieves all blockchain events of a specific type',
  })
  @ApiParam({
    name: 'eventType',
    description: 'Event type to filter',
    enum: BlockchainEventType,
    example: BlockchainEventType.ASSET_TRANSFER,
  })
  @ApiQuery({
    name: 'assetId',
    required: false,
    description: 'Filter by asset ID',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of events to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Events by type retrieved successfully',
    type: [BlockchainEvent],
  })
  async findByEventType(
    @Param('eventType') eventType: BlockchainEventType,
    @Query() query: Partial<BlockchainEventsQueryDto>,
  ): Promise<BlockchainEvent[]> {
    return await this.blockchainEventsService.findByEventType(eventType, query);
  }

  @Get('transaction/:transactionHash')
  @ApiOperation({
    summary: 'Get blockchain event by transaction hash',
    description: 'Retrieves a specific blockchain event by its transaction hash',
  })
  @ApiParam({
    name: 'transactionHash',
    description: 'StarkNet transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain event retrieved successfully',
    type: BlockchainEvent,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blockchain event not found',
  })
  async findByTransactionHash(@Param('transactionHash') transactionHash: string): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.findByTransactionHash(transactionHash);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Get recent blockchain events',
    description: 'Retrieves the most recent blockchain events',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of recent events to return',
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent events retrieved successfully',
    type: [BlockchainEvent],
  })
  async findRecent(@Query('limit') limit: number = 10): Promise<BlockchainEvent[]> {
    return await this.blockchainEventsService.findAll({
      limit,
      sortBy: 'timestamp',
      sortOrder: 'DESC',
    }).then(result => result.events);
  }

  @Get('failed')
  @ApiOperation({
    summary: 'Get failed blockchain events',
    description: 'Retrieves blockchain events that have failed or been reverted',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of failed events to return',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Failed events retrieved successfully',
    type: [BlockchainEvent],
  })
  async findFailed(@Query('limit') limit: number = 20): Promise<BlockchainEvent[]> {
    return await this.blockchainEventsService.findAll({
      hasError: true,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'DESC',
    }).then(result => result.events);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Get pending blockchain events',
    description: 'Retrieves blockchain events that are still pending confirmation',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of pending events to return',
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pending events retrieved successfully',
    type: [BlockchainEvent],
  })
  async findPending(@Query('limit') limit: number = 20): Promise<BlockchainEvent[]> {
    return await this.blockchainEventsService.findAll({
      status: 'pending' as any,
      limit,
      sortBy: 'timestamp',
      sortOrder: 'DESC',
    }).then(result => result.events);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get blockchain event by ID',
    description: 'Retrieves a specific blockchain event by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Blockchain event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain event retrieved successfully',
    type: BlockchainEvent,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blockchain event not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update blockchain event',
    description: 'Updates a blockchain event with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'Blockchain event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain event updated successfully',
    type: BlockchainEvent,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blockchain event not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlockchainEventDto: UpdateBlockchainEventDto,
  ): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.update(id, updateBlockchainEventDto);
  }

  @Patch(':id/confirm')
  @ApiOperation({
    summary: 'Confirm blockchain event',
    description: 'Marks a blockchain event as confirmed',
  })
  @ApiParam({
    name: 'id',
    description: 'Blockchain event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain event confirmed successfully',
    type: BlockchainEvent,
  })
  async confirm(@Param('id', ParseUUIDPipe) id: string): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.update(id, {
      status: 'confirmed' as any,
      confirmations: 12,
      metadata: {
        confirmed_at: new Date().toISOString(),
        confirmed_by: 'system',
      },
    });
  }

  @Patch(':id/fail')
  @ApiOperation({
    summary: 'Mark blockchain event as failed',
    description: 'Marks a blockchain event as failed with optional error message',
  })
  @ApiParam({
    name: 'id',
    description: 'Blockchain event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Blockchain event marked as failed',
    type: BlockchainEvent,
  })
  async markAsFailed(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { errorMessage?: string },
  ): Promise<BlockchainEvent> {
    return await this.blockchainEventsService.update(id, {
      status: 'failed' as any,
      errorMessage: body.errorMessage || 'Transaction failed',
      metadata: {
        failed_at: new Date().toISOString(),
        failed_by: 'system',
      },
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete blockchain event',
    description: 'Deletes a blockchain event record',
  })
  @ApiParam({
    name: 'id',
    description: 'Blockchain event ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Blockchain event deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Blockchain event not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.blockchainEventsService.remove(id);
  }
}
