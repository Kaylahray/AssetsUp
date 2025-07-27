import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between } from 'typeorm';
import { WarrantyClaim } from './entities/warranty-claim.entity';
import { CreateWarrantyClaimDto } from './dto/create-warranty-claim.dto';
import { UpdateWarrantyClaimDto } from './dto/update-warranty-claim.dto';
import { WarrantyClaimQueryDto } from './dto/warranty-claim-query.dto';
import { WarrantyClaimStatus, VALID_STATUS_TRANSITIONS } from './enums/warranty-claim-status.enum';

@Injectable()
export class WarrantyClaimsService {
  private readonly logger = new Logger(WarrantyClaimsService.name);

  constructor(
    @InjectRepository(WarrantyClaim)
    private readonly warrantyClaimRepository: Repository<WarrantyClaim>,
  ) {}

  async create(createWarrantyClaimDto: CreateWarrantyClaimDto): Promise<WarrantyClaim> {
    try {
      const warrantyClaim = this.warrantyClaimRepository.create({
        ...createWarrantyClaimDto,
        status: WarrantyClaimStatus.SUBMITTED,
        claimDate: new Date(),
      });

      const savedClaim = await this.warrantyClaimRepository.save(warrantyClaim);
      this.logger.log(`Created warranty claim with ID: ${savedClaim.claimId}`);
      
      return savedClaim;
    } catch (error) {
      this.logger.error(`Failed to create warranty claim: ${error.message}`);
      throw new BadRequestException('Failed to create warranty claim');
    }
  }

  async findAll(queryDto: WarrantyClaimQueryDto): Promise<{ data: WarrantyClaim[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = queryDto;
    
    const findOptions: FindManyOptions<WarrantyClaim> = {
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    };

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.assetId) {
      where.assetId = filters.assetId;
    }

    if (filters.fromDate || filters.toDate) {
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : new Date('1900-01-01');
      const toDate = filters.toDate ? new Date(filters.toDate) : new Date();
      where.claimDate = Between(fromDate, toDate);
    }

    findOptions.where = where;

    const [data, total] = await this.warrantyClaimRepository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(claimId: string): Promise<WarrantyClaim> {
    const warrantyClaim = await this.warrantyClaimRepository.findOne({
      where: { claimId },
    });

    if (!warrantyClaim) {
      throw new NotFoundException(`Warranty claim with ID ${claimId} not found`);
    }

    return warrantyClaim;
  }

  async update(claimId: string, updateWarrantyClaimDto: UpdateWarrantyClaimDto): Promise<WarrantyClaim> {
    const existingClaim = await this.findOne(claimId);

    // Validate status transition if status is being updated
    if (updateWarrantyClaimDto.status && updateWarrantyClaimDto.status !== existingClaim.status) {
      this.validateStatusTransition(existingClaim.status, updateWarrantyClaimDto.status);
    }

    try {
      await this.warrantyClaimRepository.update(claimId, updateWarrantyClaimDto);
      const updatedClaim = await this.findOne(claimId);
      
      this.logger.log(`Updated warranty claim with ID: ${claimId}`);
      return updatedClaim;
    } catch (error) {
      this.logger.error(`Failed to update warranty claim ${claimId}: ${error.message}`);
      throw new BadRequestException('Failed to update warranty claim');
    }
  }

  async remove(claimId: string): Promise<void> {
    const warrantyClaim = await this.findOne(claimId);
    
    try {
      await this.warrantyClaimRepository.remove(warrantyClaim);
      this.logger.log(`Deleted warranty claim with ID: ${claimId}`);
    } catch (error) {
      this.logger.error(`Failed to delete warranty claim ${claimId}: ${error.message}`);
      throw new BadRequestException('Failed to delete warranty claim');
    }
  }

  async updateStatus(claimId: string, newStatus: WarrantyClaimStatus, resolutionNotes?: string): Promise<WarrantyClaim> {
    const existingClaim = await this.findOne(claimId);
    this.validateStatusTransition(existingClaim.status, newStatus);

    const updateDto: UpdateWarrantyClaimDto = { status: newStatus };
    if (resolutionNotes) {
      updateDto.resolutionNotes = resolutionNotes;
    }

    return this.update(claimId, updateDto);
  }

  async addSupportingDocuments(claimId: string, documentPaths: string[]): Promise<WarrantyClaim> {
    const existingClaim = await this.findOne(claimId);
    const currentDocs = existingClaim.supportingDocs || [];
    const updatedDocs = [...currentDocs, ...documentPaths];

    return this.update(claimId, { supportingDocs: updatedDocs });
  }

  private validateStatusTransition(currentStatus: WarrantyClaimStatus, newStatus: WarrantyClaimStatus): void {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(', ')}`
      );
    }
  }

  async getClaimsByStatus(status: WarrantyClaimStatus): Promise<WarrantyClaim[]> {
    return this.warrantyClaimRepository.find({
      where: { status },
      order: { claimDate: 'DESC' },
    });
  }

  async getClaimStatistics(): Promise<Record<WarrantyClaimStatus, number>> {
    const stats = await this.warrantyClaimRepository
      .createQueryBuilder('claim')
      .select('claim.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('claim.status')
      .getRawMany();

    const result: Record<WarrantyClaimStatus, number> = {
      [WarrantyClaimStatus.SUBMITTED]: 0,
      [WarrantyClaimStatus.IN_REVIEW]: 0,
      [WarrantyClaimStatus.APPROVED]: 0,
      [WarrantyClaimStatus.REJECTED]: 0,
      [WarrantyClaimStatus.RESOLVED]: 0,
    };

    stats.forEach((stat) => {
      result[stat.status] = parseInt(stat.count);
    });

    return result;
  }
}