import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ProcurementRequest, ProcurementStatus } from './entities/procurement-request.entity';
import { AssetRegistration, AssetStatus } from './entities/asset-registration.entity';
import {
  CreateProcurementRequestDto,
  ApproveProcurementRequestDto,
  RejectProcurementRequestDto,
  UpdateProcurementRequestDto,
  ProcurementRequestResponseDto,
  AssetRegistrationResponseDto,
  ProcurementSummaryDto,
} from './dto/procurement.dto';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(ProcurementRequest)
    private readonly procurementRequestRepository: Repository<ProcurementRequest>,
    
    @InjectRepository(AssetRegistration)
    private readonly assetRegistrationRepository: Repository<AssetRegistration>,
  ) {}

  /**
   * Create a new procurement request
   */
  async create(createDto: CreateProcurementRequestDto): Promise<ProcurementRequest> {
    const procurementRequest = this.procurementRequestRepository.create({
      ...createDto,
      status: ProcurementStatus.PENDING,
    });

    return await this.procurementRequestRepository.save(procurementRequest);
  }

  /**
   * Find all procurement requests with optional filtering
   */
  async findAll(filters?: {
    status?: ProcurementStatus;
    requestedBy?: string;
    itemName?: string;
  }): Promise<ProcurementRequest[]> {
    const queryBuilder = this.procurementRequestRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.assetRegistration', 'ar')
      .orderBy('pr.requestedAt', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('pr.status = :status', { status: filters.status });
    }

    if (filters?.requestedBy) {
      queryBuilder.andWhere('pr.requestedBy = :requestedBy', { 
        requestedBy: filters.requestedBy 
      });
    }

    if (filters?.itemName) {
      queryBuilder.andWhere('LOWER(pr.itemName) LIKE LOWER(:itemName)', { 
        itemName: `%${filters.itemName}%` 
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find one procurement request by ID
   */
  async findOne(id: number): Promise<ProcurementRequest> {
    const procurementRequest = await this.procurementRequestRepository.findOne({
      where: { id } as FindOptionsWhere<ProcurementRequest>,
      relations: ['assetRegistration'],
    });

    if (!procurementRequest) {
      throw new NotFoundException(`Procurement request with ID ${id} not found`);
    }

    return procurementRequest;
  }

  /**
   * Update a procurement request (only if pending)
   */
  async update(
    id: number,
    updateDto: UpdateProcurementRequestDto,
  ): Promise<ProcurementRequest> {
    const procurementRequest = await this.findOne(id);

    if (procurementRequest.status !== ProcurementStatus.PENDING) {
      throw new BadRequestException('Cannot update a request that has already been decided');
    }

    Object.assign(procurementRequest, updateDto);
    return await this.procurementRequestRepository.save(procurementRequest);
  }

  /**
   * Approve a procurement request and create asset registration
   */
  async approve(
    id: number,
    approveDto: ApproveProcurementRequestDto,
  ): Promise<{ procurementRequest: ProcurementRequest; assetRegistration: AssetRegistration }> {
    const procurementRequest = await this.findOne(id);

    if (procurementRequest.status !== ProcurementStatus.PENDING) {
      throw new BadRequestException('Request has already been decided');
    }

    // Create asset registration first
    const assetRegistration = this.assetRegistrationRepository.create({
      assetName: procurementRequest.itemName,
      description: approveDto.description,
      serialNumber: approveDto.serialNumber,
      model: approveDto.model,
      manufacturer: approveDto.manufacturer,
      cost: approveDto.cost,
      assignedTo: approveDto.assignedTo,
      location: approveDto.location,
      status: AssetStatus.PENDING,
      assetId: '', // Will be set after save
    });

    const savedAssetRegistration = await this.assetRegistrationRepository.save(assetRegistration);
    
    // Generate asset ID based on saved ID
    savedAssetRegistration.assetId = savedAssetRegistration.generateAssetId();
    await this.assetRegistrationRepository.save(savedAssetRegistration);

    // Update procurement request
    procurementRequest.status = ProcurementStatus.APPROVED;
    procurementRequest.decidedAt = new Date();
    procurementRequest.decidedBy = approveDto.decidedBy;
    procurementRequest.notes = approveDto.notes || procurementRequest.notes;
    procurementRequest.assetRegistrationId = savedAssetRegistration.id;

    const savedProcurementRequest = await this.procurementRequestRepository.save(procurementRequest);

    return {
      procurementRequest: savedProcurementRequest,
      assetRegistration: savedAssetRegistration,
    };
  }

  /**
   * Reject a procurement request
   */
  async reject(
    id: number,
    rejectDto: RejectProcurementRequestDto,
  ): Promise<ProcurementRequest> {
    const procurementRequest = await this.findOne(id);

    if (procurementRequest.status !== ProcurementStatus.PENDING) {
      throw new BadRequestException('Request has already been decided');
    }

    procurementRequest.status = ProcurementStatus.REJECTED;
    procurementRequest.decidedAt = new Date();
    procurementRequest.decidedBy = rejectDto.decidedBy;
    procurementRequest.notes = rejectDto.notes || procurementRequest.notes;

    return await this.procurementRequestRepository.save(procurementRequest);
  }

  /**
   * Delete a procurement request (only if pending)
   */
  async remove(id: number): Promise<void> {
    const procurementRequest = await this.findOne(id);

    if (procurementRequest.status !== ProcurementStatus.PENDING) {
      throw new BadRequestException('Cannot delete a request that has already been decided');
    }

    await this.procurementRequestRepository.remove(procurementRequest);
  }

  /**
   * Get asset registration by procurement request ID
   */
  async getAssetRegistration(procurementRequestId: number): Promise<AssetRegistration> {
    const procurementRequest = await this.findOne(procurementRequestId);

    if (!procurementRequest.assetRegistration) {
      throw new NotFoundException('No asset registration found for this procurement request');
    }

    return procurementRequest.assetRegistration;
  }

  /**
   * Get asset registration by asset ID
   */
  async getAssetByAssetId(assetId: string): Promise<AssetRegistration> {
    const assetRegistration = await this.assetRegistrationRepository.findOne({
      where: { assetId } as FindOptionsWhere<AssetRegistration>,
      relations: ['procurementRequest'],
    });

    if (!assetRegistration) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    return assetRegistration;
  }

  /**
   * Get all asset registrations with filtering
   */
  async getAllAssets(filters?: {
    status?: AssetStatus;
    assignedTo?: string;
    location?: string;
  }): Promise<AssetRegistration[]> {
    const queryBuilder = this.assetRegistrationRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.procurementRequest', 'pr')
      .orderBy('ar.createdAt', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('ar.status = :status', { status: filters.status });
    }

    if (filters?.assignedTo) {
      queryBuilder.andWhere('ar.assignedTo = :assignedTo', { 
        assignedTo: filters.assignedTo 
      });
    }

    if (filters?.location) {
      queryBuilder.andWhere('LOWER(ar.location) LIKE LOWER(:location)', { 
        location: `%${filters.location}%` 
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Update asset registration status
   */
  async updateAssetStatus(
    assetId: string,
    status: AssetStatus,
    updatedBy?: string,
  ): Promise<AssetRegistration> {
    const assetRegistration = await this.getAssetByAssetId(assetId);
    
    assetRegistration.status = status;
    
    return await this.assetRegistrationRepository.save(assetRegistration);
  }

  /**
   * Get procurement summary statistics
   */
  async getSummary(): Promise<ProcurementSummaryDto> {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalAssetsCreated,
    ] = await Promise.all([
      this.procurementRequestRepository.count(),
      this.procurementRequestRepository.count({ 
        where: { status: ProcurementStatus.PENDING } 
      }),
      this.procurementRequestRepository.count({ 
        where: { status: ProcurementStatus.APPROVED } 
      }),
      this.procurementRequestRepository.count({ 
        where: { status: ProcurementStatus.REJECTED } 
      }),
      this.assetRegistrationRepository.count(),
    ]);

    return new ProcurementSummaryDto({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      totalAssetsCreated,
    });
  }

  /**
   * Get pending requests by user
   */
  async getPendingRequestsByUser(requestedBy: string): Promise<ProcurementRequest[]> {
    return await this.procurementRequestRepository.find({
      where: {
        requestedBy,
        status: ProcurementStatus.PENDING,
      } as FindOptionsWhere<ProcurementRequest>,
      order: { requestedAt: 'DESC' },
    });
  }

  /**
   * Get assets assigned to a user
   */
  async getAssetsByAssignee(assignedTo: string): Promise<AssetRegistration[]> {
    return await this.assetRegistrationRepository.find({
      where: { assignedTo } as FindOptionsWhere<AssetRegistration>,
      relations: ['procurementRequest'],
      order: { createdAt: 'DESC' },
    });
  }
}
