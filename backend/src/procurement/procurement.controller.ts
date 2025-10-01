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

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  /**
   * Create a new procurement request
   * POST /procurement
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createDto: CreateProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.create(createDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  /**
   * Get all procurement requests with optional filtering
   * GET /procurement?status=pending&requestedBy=john&itemName=laptop
   */
  @Get()
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

  /**
   * Get procurement summary statistics
   * GET /procurement/summary
   */
  @Get('summary')
  getSummary(): Promise<ProcurementSummaryDto> {
    return this.procurementService.getSummary();
  }

  /**
   * Get pending requests by user
   * GET /procurement/pending/:requestedBy
   */
  @Get('pending/:requestedBy')
  async getPendingByUser(
    @Param('requestedBy') requestedBy: string,
  ): Promise<ProcurementRequestResponseDto[]> {
    const requests = await this.procurementService.getPendingRequestsByUser(requestedBy);
    return requests.map(pr => new ProcurementRequestResponseDto(pr));
  }

  /**
   * Get assets assigned to a user
   * GET /procurement/assets/assigned/:assignedTo
   */
  @Get('assets/assigned/:assignedTo')
  async getAssetsByAssignee(
    @Param('assignedTo') assignedTo: string,
  ): Promise<AssetRegistrationResponseDto[]> {
    const assets = await this.procurementService.getAssetsByAssignee(assignedTo);
    return assets.map(asset => new AssetRegistrationResponseDto(asset));
  }

  /**
   * Get all assets with filtering
   * GET /procurement/assets?status=active&assignedTo=john&location=office
   */
  @Get('assets')
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

  /**
   * Get asset by asset ID
   * GET /procurement/assets/:assetId
   */
  @Get('assets/:assetId')
  async getAssetByAssetId(
    @Param('assetId') assetId: string,
  ): Promise<AssetRegistrationResponseDto> {
    const asset = await this.procurementService.getAssetByAssetId(assetId);
    return new AssetRegistrationResponseDto(asset);
  }

  /**
   * Update asset status
   * PATCH /procurement/assets/:assetId/status
   */
  @Patch('assets/:assetId/status')
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

  /**
   * Get specific procurement request by ID
   * GET /procurement/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.findOne(id);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  /**
   * Get asset registration for a procurement request
   * GET /procurement/:id/asset
   */
  @Get(':id/asset')
  async getAssetRegistration(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AssetRegistrationResponseDto> {
    const asset = await this.procurementService.getAssetRegistration(id);
    return new AssetRegistrationResponseDto(asset);
  }

  /**
   * Approve a procurement request and create asset registration
   * POST /procurement/:id/approve
   */
  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
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

  /**
   * Reject a procurement request
   * POST /procurement/:id/reject
   */
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) rejectDto: RejectProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.reject(id, rejectDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  /**
   * Update a procurement request (only if pending)
   * PATCH /procurement/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateProcurementRequestDto,
  ): Promise<ProcurementRequestResponseDto> {
    const procurementRequest = await this.procurementService.update(id, updateDto);
    return new ProcurementRequestResponseDto(procurementRequest);
  }

  /**
   * Delete a procurement request (only if pending)
   * DELETE /procurement/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.procurementService.remove(id);
  }
}
