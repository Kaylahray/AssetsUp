import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ProcurementService } from './procurement.service';
import {
  CreateProcurementRequestDto,
  ApproveProcurementRequestDto,
  RejectProcurementRequestDto,
  UpdateProcurementRequestDto,
  ProcurementRequestResponseDto,
  AssetRegistrationResponseDto,
  ProcurementSummaryDto,
} from './dto/procurement.dto';
import { ProcurementStatus } from './entities/procurement-request.entity';
import { AssetStatus } from './entities/asset-registration.entity';

@ApiTags('Procurement')
@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new procurement request' })
  @ApiResponse({ status: 201, description: 'Procurement request created successfully', type: ProcurementRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreateProcurementRequestDto })
  async create(
    @Body(ValidationPipe) createDto: CreateProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.create(createDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  @Get()
  @ApiOperation({ summary: 'Get all procurement requests with optional filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ProcurementStatus })
  @ApiQuery({ name: 'requestedBy', required: false, type: String })
  @ApiQuery({ name: 'itemName', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Procurement requests retrieved successfully', type: [ProcurementRequestResponseDto] })
  async findAll(
    @Query('status') status?: string,
    @Query('requestedBy') requestedBy?: string,
    @Query('itemName') itemName?: string,
  ): Promise<ProcurementRequestResponseDto[]> {
    const filters: any = {};

    if (status) {
      if (Object.values(ProcurementStatus).includes(status as ProcurementStatus)) {
        filters.status = status as ProcurementStatus;
      } else {
        throw new BadRequestException(`Invalid status: ${status}`);
      }
    }

    if (requestedBy) {
      filters.requestedBy = requestedBy;
    }

    if (itemName) {
      filters.itemName = itemName;
    }

    const procurementRequests = await this.procurementService.findAll(filters);
    return procurementRequests.map(pr => new ProcurementRequestResponseDto(pr));
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get procurement summary statistics' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully', type: ProcurementSummaryDto })
  getSummary(): Promise<ProcurementSummaryDto> {
    return this.procurementService.getSummary();
  }

  @Get('pending/:requestedBy')
  @ApiOperation({ summary: 'Get pending requests by user' })
  @ApiParam({ name: 'requestedBy', description: 'User who made the requests' })
  @ApiResponse({ status: 200, description: 'Pending requests retrieved successfully', type: [ProcurementRequestResponseDto] })
  async getPendingByUser(
    @Param('requestedBy') requestedBy: string,
  ): Promise<ProcurementRequestResponseDto[]> {
    const requests = await this.procurementService.getPendingRequestsByUser(requestedBy);
    return requests.map(pr => new ProcurementRequestResponseDto(pr));
  }

  @Get('assets/assigned/:assignedTo')
  @ApiOperation({ summary: 'Get assets assigned to a user' })
  @ApiParam({ name: 'assignedTo', description: 'User assigned to assets' })
  @ApiResponse({ status: 200, description: 'Assigned assets retrieved successfully', type: [AssetRegistrationResponseDto] })
  async getAssetsByAssignee(
    @Param('assignedTo') assignedTo: string,
  ): Promise<AssetRegistrationResponseDto[]> {
    const assets = await this.procurementService.getAssetsByAssignee(assignedTo);
    return assets.map(asset => new AssetRegistrationResponseDto(asset));
  }

  @Get('assets')
  @ApiOperation({ summary: 'Get all assets with filtering' })
  @ApiQuery({ name: 'status', required: false, enum: AssetStatus })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully', type: [AssetRegistrationResponseDto] })
  async getAllAssets(
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('location') location?: string,
  ): Promise<AssetRegistrationResponseDto[]> {
    const filters: any = {};

    if (status) {
      if (Object.values(AssetStatus).includes(status as AssetStatus)) {
        filters.status = status as AssetStatus;
      } else {
        throw new BadRequestException(`Invalid asset status: ${status}`);
      }
    }

    if (assignedTo) {
      filters.assignedTo = assignedTo;
    }

    if (location) {
      filters.location = location;
    }

    const assets = await this.procurementService.getAllAssets(filters);
    return assets.map(asset => new AssetRegistrationResponseDto(asset));
  }

  @Get('assets/:assetId')
  @ApiOperation({ summary: 'Get asset by asset ID' })
  @ApiParam({ name: 'assetId', description: 'Asset identifier' })
  @ApiResponse({ status: 200, description: 'Asset retrieved successfully', type: AssetRegistrationResponseDto })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async getAssetByAssetId(
    @Param('assetId') assetId: string,
  ): Promise<AssetRegistrationResponseDto> {
    const asset = await this.procurementService.getAssetByAssetId(assetId);
    return new AssetRegistrationResponseDto(asset);
  }

  @Patch('assets/:assetId/status')
  @ApiOperation({ summary: 'Update asset status' })
  @ApiParam({ name: 'assetId', description: 'Asset identifier' })
  @ApiResponse({ status: 200, description: 'Asset status updated successfully', type: AssetRegistrationResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid status' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  @ApiBody({ 
    schema: { 
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(AssetStatus) },
        updatedBy: { type: 'string', example: 'admin@company.com' }
      },
      required: ['status']
    } 
  })
  async updateAssetStatus(
    @Param('assetId') assetId: string,
    @Body('status') status: AssetStatus,
    @Body('updatedBy') updatedBy?: string,
  ): Promise<AssetRegistrationResponseDto> {
    if (!Object.values(AssetStatus).includes(status)) {
      throw new BadRequestException(`Invalid asset status: ${status}`);
    }

    const asset = await this.procurementService.updateAssetStatus(assetId, status, updatedBy);
    return new AssetRegistrationResponseDto(asset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific procurement request by ID' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ status: 200, description: 'Procurement request retrieved successfully', type: ProcurementRequestResponseDto })
  @ApiResponse({ status: 404, description: 'Procurement request not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.findOne(id);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  @Get(':id/asset')
  @ApiOperation({ summary: 'Get asset registration for a procurement request' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ status: 200, description: 'Asset registration retrieved successfully', type: AssetRegistrationResponseDto })
  @ApiResponse({ status: 404, description: 'Procurement request or asset not found' })
  async getAssetRegistration(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssetRegistrationResponseDto> {
    const asset = await this.procurementService.getAssetRegistration(id);
    return new AssetRegistrationResponseDto(asset);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a procurement request and create asset registration' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Procurement request approved and asset created successfully',
    schema: {
      type: 'object',
      properties: {
        procurementRequest: { $ref: '#/components/schemas/ProcurementRequestResponseDto' },
        assetRegistration: { $ref: '#/components/schemas/AssetRegistrationResponseDto' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid approval data' })
  @ApiResponse({ status: 404, description: 'Procurement request not found' })
  @ApiBody({ type: ApproveProcurementRequestDto })
  async approve(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) approveDto: ApproveProcurementRequestDto,
  ): Promise<{
    procurementRequest: ProcurementRequestResponseDto;
    assetRegistration: AssetRegistrationResponseDto;
  }> {
    const result = await this.procurementService.approve(id, approveDto);
    
    return {
      procurementRequest: new ProcurementRequestResponseDto(result.procurementRequest),
      assetRegistration: new AssetRegistrationResponseDto(result.assetRegistration),
    };
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a procurement request' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ status: 200, description: 'Procurement request rejected successfully', type: ProcurementRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid rejection data' })
  @ApiResponse({ status: 404, description: 'Procurement request not found' })
  @ApiBody({ type: RejectProcurementRequestDto })
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) rejectDto: RejectProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.reject(id, rejectDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a procurement request (only if pending)' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ status: 200, description: 'Procurement request updated successfully', type: ProcurementRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 404, description: 'Procurement request not found' })
  @ApiBody({ type: UpdateProcurementRequestDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.update(id, updateDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a procurement request (only if pending)' })
  @ApiParam({ name: 'id', description: 'Procurement request ID', type: Number })
  @ApiResponse({ status: 204, description: 'Procurement request deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-pending request' })
  @ApiResponse({ status: 404, description: 'Procurement request not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.procurementService.remove(id);
  }
}