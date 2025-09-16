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
  UseInterceptors,
  UploadedFile,
  Res,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FeedbackSupportService } from './feedback-support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { TicketStatus, TicketPriority, TicketCategory } from './feedback-support.enums';

@ApiTags('Feedback & Support')
@Controller('tickets')
export class FeedbackSupportController {
  constructor(private readonly feedbackSupportService: FeedbackSupportService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new support ticket',
    description: 'Creates a new support ticket for issues or feedback related to asset management operations',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Ticket created successfully',
    type: Ticket,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return await this.feedbackSupportService.create(createTicketDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tickets',
    description: 'Retrieves tickets with filtering, pagination, and analytics',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tickets: {
          type: 'array',
          items: { $ref: '#/components/schemas/Ticket' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        analytics: { type: 'object' },
      },
    },
  })
  async findAll(@Query() query: TicketQueryDto) {
    return await this.feedbackSupportService.findAll(query);
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'Get ticket analytics',
    description: 'Retrieves comprehensive analytics for support tickets',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
  })
  async getAnalytics(@Query() filters: Partial<TicketQueryDto>) {
    return await this.feedbackSupportService.getAnalytics(filters);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get tickets by user ID',
    description: 'Retrieves all tickets created by a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to filter tickets',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TicketStatus,
    description: 'Filter by ticket status',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: TicketPriority,
    description: 'Filter by ticket priority',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: TicketCategory,
    description: 'Filter by ticket category',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of tickets to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User tickets retrieved successfully',
    type: [Ticket],
  })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: Partial<TicketQueryDto>,
  ): Promise<Ticket[]> {
    return await this.feedbackSupportService.findByUserId(userId, query);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get tickets by status',
    description: 'Retrieves all tickets with a specific status',
  })
  @ApiParam({
    name: 'status',
    description: 'Ticket status to filter',
    enum: TicketStatus,
    example: TicketStatus.OPEN,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of tickets to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets by status retrieved successfully',
    type: [Ticket],
  })
  async findByStatus(
    @Param('status') status: TicketStatus,
    @Query('limit') limit: number = 50,
  ): Promise<Ticket[]> {
    return await this.feedbackSupportService.findAll({
      status,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }).then(result => result.tickets);
  }

  @Get('priority/:priority')
  @ApiOperation({
    summary: 'Get tickets by priority',
    description: 'Retrieves all tickets with a specific priority level',
  })
  @ApiParam({
    name: 'priority',
    description: 'Ticket priority to filter',
    enum: TicketPriority,
    example: TicketPriority.HIGH,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of tickets to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tickets by priority retrieved successfully',
    type: [Ticket],
  })
  async findByPriority(
    @Param('priority') priority: TicketPriority,
    @Query('limit') limit: number = 50,
  ): Promise<Ticket[]> {
    return await this.feedbackSupportService.findAll({
      priority,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }).then(result => result.tickets);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Get overdue tickets',
    description: 'Retrieves all tickets that are past their due date',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of tickets to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overdue tickets retrieved successfully',
    type: [Ticket],
  })
  async findOverdue(@Query('limit') limit: number = 50): Promise<Ticket[]> {
    return await this.feedbackSupportService.findAll({
      isOverdue: true,
      limit,
      sortBy: 'dueDate',
      sortOrder: 'ASC',
    }).then(result => result.tickets);
  }

  @Get('unassigned')
  @ApiOperation({
    summary: 'Get unassigned tickets',
    description: 'Retrieves all tickets that have not been assigned to anyone',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Maximum number of tickets to return',
    example: 50,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unassigned tickets retrieved successfully',
    type: [Ticket],
  })
  async findUnassigned(@Query('limit') limit: number = 50): Promise<Ticket[]> {
    return await this.feedbackSupportService.findAll({
      unassigned: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'ASC',
    }).then(result => result.tickets);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ticket by ID',
    description: 'Retrieves a specific ticket by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket retrieved successfully',
    type: Ticket,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ticket> {
    return await this.feedbackSupportService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ticket',
    description: 'Updates a ticket with new information',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket updated successfully',
    type: Ticket,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to update this ticket',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Headers('user-id') userId?: string,
  ): Promise<Ticket> {
    return await this.feedbackSupportService.update(id, updateTicketDto, userId);
  }

  @Patch(':id/assign')
  @ApiOperation({
    summary: 'Assign ticket to user',
    description: 'Assigns a ticket to a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket assigned successfully',
    type: Ticket,
  })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { assignedTo: string },
  ): Promise<Ticket> {
    return await this.feedbackSupportService.update(id, {
      assignedTo: body.assignedTo,
      status: TicketStatus.IN_PROGRESS,
      metadata: {
        assigned_at: new Date().toISOString(),
        assigned_by: 'system',
      },
    });
  }

  @Patch(':id/resolve')
  @ApiOperation({
    summary: 'Resolve ticket',
    description: 'Marks a ticket as resolved with optional resolution details',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket resolved successfully',
    type: Ticket,
  })
  async resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { resolution?: string; resolvedBy?: string },
    @Headers('user-id') userId?: string,
  ): Promise<Ticket> {
    return await this.feedbackSupportService.update(id, {
      status: TicketStatus.RESOLVED,
      resolution: body.resolution,
      resolvedBy: body.resolvedBy || userId,
      metadata: {
        resolved_at: new Date().toISOString(),
        resolved_by: body.resolvedBy || userId || 'system',
      },
    }, userId);
  }

  @Patch(':id/close')
  @ApiOperation({
    summary: 'Close ticket',
    description: 'Marks a ticket as closed',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket closed successfully',
    type: Ticket,
  })
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { closedBy?: string },
    @Headers('user-id') userId?: string,
  ): Promise<Ticket> {
    return await this.feedbackSupportService.update(id, {
      status: TicketStatus.CLOSED,
      closedBy: body.closedBy || userId,
      metadata: {
        closed_at: new Date().toISOString(),
        closed_by: body.closedBy || userId || 'system',
      },
    }, userId);
  }

  @Patch(':id/reopen')
  @ApiOperation({
    summary: 'Reopen ticket',
    description: 'Reopens a closed or resolved ticket',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ticket reopened successfully',
    type: Ticket,
  })
  async reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('user-id') userId?: string,
  ): Promise<Ticket> {
    return await this.feedbackSupportService.update(id, {
      status: TicketStatus.REOPENED,
      resolvedAt: null,
      closedAt: null,
      metadata: {
        reopened_at: new Date().toISOString(),
        reopened_by: userId || 'system',
      },
    }, userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload attachment to ticket',
    description: 'Uploads a file attachment to a specific ticket',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Attachment uploaded successfully',
    type: TicketAttachment,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or ticket',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to upload to this ticket',
  })
  async uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadAttachmentDto,
    @Headers('user-id') userId: string,
  ): Promise<TicketAttachment> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'application/zip',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    return await this.feedbackSupportService.uploadAttachment(id, file, uploadDto, userId);
  }

  @Get(':id/attachments')
  @ApiOperation({
    summary: 'Get ticket attachments',
    description: 'Retrieves all attachments for a specific ticket',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Attachments retrieved successfully',
    type: [TicketAttachment],
  })
  async getAttachments(@Param('id', ParseUUIDPipe) id: string): Promise<TicketAttachment[]> {
    const ticket = await this.feedbackSupportService.findOne(id);
    return ticket.attachments || [];
  }

  @Get(':id/attachments/:attachmentId/download')
  @ApiOperation({
    summary: 'Download attachment',
    description: 'Downloads a specific attachment file',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'attachmentId',
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attachment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to download this attachment',
  })
  async downloadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Res() res: Response,
    @Headers('user-id') userId?: string,
  ): Promise<void> {
    const { attachment, fileBuffer } = await this.feedbackSupportService.downloadAttachment(
      id,
      attachmentId,
      userId,
    );

    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
      'Content-Length': attachment.fileSize.toString(),
    });

    res.send(fileBuffer);
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({
    summary: 'Delete attachment',
    description: 'Deletes a specific attachment from a ticket',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'attachmentId',
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Attachment deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Attachment not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this attachment',
  })
  async deleteAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
    @Headers('user-id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return await this.feedbackSupportService.deleteAttachment(id, attachmentId, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete ticket',
    description: 'Deletes a ticket and all its attachments',
  })
  @ApiParam({
    name: 'id',
    description: 'Ticket ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Ticket deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ticket not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not authorized to delete this ticket',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('user-id') userId?: string,
  ): Promise<void> {
    return await this.feedbackSupportService.remove(id, userId);
  }
}
