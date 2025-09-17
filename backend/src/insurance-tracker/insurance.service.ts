import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Like } from 'typeorm';
import { InsurancePolicy } from './entities/insurance-policy.entity';
import { PolicyDocument } from './entities/policy-document.entity';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { InsuranceQueryDto } from './dto/insurance-query.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { InsurancePolicyStatus, RenewalStatus } from './insurance.enums';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(InsurancePolicy)
    private insurancePolicyRepository: Repository<InsurancePolicy>,
    @InjectRepository(PolicyDocument)
    private policyDocumentRepository: Repository<PolicyDocument>,
  ) {}

  async create(createInsurancePolicyDto: CreateInsurancePolicyDto): Promise<InsurancePolicy> {
    // Validate dates
    const startDate = new Date(createInsurancePolicyDto.coverageStart);
    const endDate = new Date(createInsurancePolicyDto.coverageEnd);

    if (startDate >= endDate) {
      throw new BadRequestException('Coverage start date must be before end date');
    }

    // Check for duplicate policy number
    const existingPolicy = await this.insurancePolicyRepository.findOne({
      where: { policyNumber: createInsurancePolicyDto.policyNumber },
    });

    if (existingPolicy) {
      throw new BadRequestException('Policy number already exists');
    }

    // Validate that either assetId or assetCategory is provided
    if (!createInsurancePolicyDto.assetId && !createInsurancePolicyDto.assetCategory) {
      throw new BadRequestException('Either assetId or assetCategory must be provided');
    }

    const insurancePolicy = this.insurancePolicyRepository.create({
      ...createInsurancePolicyDto,
      coverageStart: startDate,
      coverageEnd: endDate,
      lastRenewalDate: createInsurancePolicyDto.lastRenewalDate 
        ? new Date(createInsurancePolicyDto.lastRenewalDate) 
        : null,
      nextRenewalDate: createInsurancePolicyDto.nextRenewalDate 
        ? new Date(createInsurancePolicyDto.nextRenewalDate) 
        : null,
    });

    return await this.insurancePolicyRepository.save(insurancePolicy);
  }

  async findAll(queryDto: InsuranceQueryDto): Promise<{ 
    data: InsurancePolicy[]; 
    total: number; 
    page: number; 
    limit: number;
    summary: {
      totalPolicies: number;
      activePolicies: number;
      expiredPolicies: number;
      expiringSoon: number;
      totalInsuredValue: number;
    };
  }> {
    const queryBuilder = this.createQueryBuilder(queryDto);
    
    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .skip((queryDto.page - 1) * queryDto.limit)
      .take(queryDto.limit)
      .getMany();

    // Calculate summary statistics
    const summaryQuery = this.insurancePolicyRepository.createQueryBuilder('policy');
    const allPolicies = await summaryQuery.getMany();
    
    const summary = {
      totalPolicies: allPolicies.length,
      activePolicies: allPolicies.filter(p => p.status === InsurancePolicyStatus.ACTIVE).length,
      expiredPolicies: allPolicies.filter(p => p.isExpired).length,
      expiringSoon: allPolicies.filter(p => p.isExpiringSoon).length,
      totalInsuredValue: allPolicies.reduce((sum, p) => sum + Number(p.insuredValue), 0),
    };

    return {
      data,
      total,
      page: queryDto.page,
      limit: queryDto.limit,
      summary,
    };
  }

  async findOne(id: string): Promise<InsurancePolicy> {
    const insurancePolicy = await this.insurancePolicyRepository.findOne({
      where: { id },
      relations: ['documents'],
    });

    if (!insurancePolicy) {
      throw new NotFoundException(`Insurance Policy with ID ${id} not found`);
    }

    return insurancePolicy;
  }

  async update(id: string, updateInsurancePolicyDto: UpdateInsurancePolicyDto): Promise<InsurancePolicy> {
    const insurancePolicy = await this.findOne(id);

    // Validate dates if provided
    if (updateInsurancePolicyDto.coverageStart || updateInsurancePolicyDto.coverageEnd) {
      const startDate = updateInsurancePolicyDto.coverageStart 
        ? new Date(updateInsurancePolicyDto.coverageStart)
        : insurancePolicy.coverageStart;
      const endDate = updateInsurancePolicyDto.coverageEnd
        ? new Date(updateInsurancePolicyDto.coverageEnd)
        : insurancePolicy.coverageEnd;

      if (startDate >= endDate) {
        throw new BadRequestException('Coverage start date must be before end date');
      }
    }

    // Check for duplicate policy number if it's being updated
    if (updateInsurancePolicyDto.policyNumber && 
        updateInsurancePolicyDto.policyNumber !== insurancePolicy.policyNumber) {
      const existingPolicy = await this.insurancePolicyRepository.findOne({
        where: { policyNumber: updateInsurancePolicyDto.policyNumber },
      });

      if (existingPolicy) {
        throw new BadRequestException('Policy number already exists');
      }
    }

    const updateData = { ...updateInsurancePolicyDto };
    if (updateInsurancePolicyDto.coverageStart) {
      updateData.coverageStart = new Date(updateInsurancePolicyDto.coverageStart);
    }
    if (updateInsurancePolicyDto.coverageEnd) {
      updateData.coverageEnd = new Date(updateInsurancePolicyDto.coverageEnd);
    }
    if (updateInsurancePolicyDto.lastRenewalDate) {
      updateData.lastRenewalDate = new Date(updateInsurancePolicyDto.lastRenewalDate);
    }
    if (updateInsurancePolicyDto.nextRenewalDate) {
      updateData.nextRenewalDate = new Date(updateInsurancePolicyDto.nextRenewalDate);
    }

    await this.insurancePolicyRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const insurancePolicy = await this.findOne(id);
    
    // Remove associated documents from filesystem
    for (const document of insurancePolicy.documents) {
      await this.removeDocumentFile(document.filePath);
    }
    
    await this.insurancePolicyRepository.remove(insurancePolicy);
  }

  async findByAsset(assetId: string): Promise<InsurancePolicy[]> {
    return await this.insurancePolicyRepository.find({
      where: { assetId },
      relations: ['documents'],
      order: { coverageEnd: 'DESC' },
    });
  }

  async findByCategory(assetCategory: string): Promise<InsurancePolicy[]> {
    return await this.insurancePolicyRepository.find({
      where: { assetCategory },
      relations: ['documents'],
      order: { coverageEnd: 'DESC' },
    });
  }

  async findExpiring(days: number = 30): Promise<InsurancePolicy[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.insurancePolicyRepository
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.documents', 'documents')
      .where('policy.coverageEnd <= :futureDate', { futureDate })
      .andWhere('policy.coverageEnd > :now', { now: new Date() })
      .andWhere('policy.status = :status', { status: InsurancePolicyStatus.ACTIVE })
      .orderBy('policy.coverageEnd', 'ASC')
      .getMany();
  }

  async findExpired(): Promise<InsurancePolicy[]> {
    return await this.insurancePolicyRepository
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.documents', 'documents')
      .where('policy.coverageEnd < :now', { now: new Date() })
      .andWhere('policy.status != :status', { status: InsurancePolicyStatus.EXPIRED })
      .orderBy('policy.coverageEnd', 'DESC')
      .getMany();
  }

  async findDueForRenewal(): Promise<InsurancePolicy[]> {
    const policies = await this.insurancePolicyRepository.find({
      where: { status: InsurancePolicyStatus.ACTIVE },
      relations: ['documents'],
    });

    return policies.filter(policy => 
      policy.renewalStatus === RenewalStatus.DUE_SOON || 
      policy.renewalStatus === RenewalStatus.OVERDUE
    );
  }

  async renewPolicy(id: string, newCoverageEnd: string, newInsuredValue?: number): Promise<InsurancePolicy> {
    const policy = await this.findOne(id);
    
    const renewalDate = new Date();
    const newEndDate = new Date(newCoverageEnd);
    
    if (newEndDate <= renewalDate) {
      throw new BadRequestException('New coverage end date must be in the future');
    }

    const updateData: Partial<InsurancePolicy> = {
      coverageEnd: newEndDate,
      lastRenewalDate: renewalDate,
      status: InsurancePolicyStatus.ACTIVE,
    };

    if (newInsuredValue) {
      updateData.insuredValue = newInsuredValue;
    }

    await this.insurancePolicyRepository.update(id, updateData);
    return await this.findOne(id);
  }

  // Document management
  async uploadDocument(
    file: Express.Multer.File, 
    uploadDocumentDto: UploadDocumentDto
  ): Promise<PolicyDocument> {
    const policy = await this.findOne(uploadDocumentDto.insurancePolicyId);
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'uploads', 'insurance');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    const document = this.policyDocumentRepository.create({
      insurancePolicyId: uploadDocumentDto.insurancePolicyId,
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath,
      documentType: uploadDocumentDto.documentType,
      description: uploadDocumentDto.description,
      uploadedBy: uploadDocumentDto.uploadedBy,
      uploadedAt: new Date(),
    });

    return await this.policyDocumentRepository.save(document);
  }

  async getDocuments(policyId: string): Promise<PolicyDocument[]> {
    await this.findOne(policyId); // Ensure policy exists
    
    return await this.policyDocumentRepository.find({
      where: { insurancePolicyId: policyId },
      order: { createdAt: 'DESC' },
    });
  }

  async removeDocument(documentId: string): Promise<void> {
    const document = await this.policyDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Remove file from filesystem
    await this.removeDocumentFile(document.filePath);
    
    await this.policyDocumentRepository.remove(document);
  }

  private async removeDocumentFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to remove file: ${filePath}`, error);
    }
  }

  // Automated policy monitoring
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkForExpiredPolicies(): Promise<void> {
    const expiredPolicies = await this.findExpired();
    
    for (const policy of expiredPolicies) {
      await this.insurancePolicyRepository.update(policy.id, {
        status: InsurancePolicyStatus.EXPIRED,
      });
    }

    if (expiredPolicies.length > 0) {
      console.log(`Updated ${expiredPolicies.length} expired insurance policies`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkForRenewalReminders(): Promise<void> {
    const dueForRenewal = await this.findDueForRenewal();
    
    for (const policy of dueForRenewal) {
      if (policy.renewalStatus === RenewalStatus.DUE_SOON) {
        await this.insurancePolicyRepository.update(policy.id, {
          status: InsurancePolicyStatus.PENDING_RENEWAL,
        });
      }
    }

    if (dueForRenewal.length > 0) {
      console.log(`Found ${dueForRenewal.length} policies due for renewal`);
    }
  }

  // Analytics and reporting
  async getPolicyAnalytics(): Promise<{
    totalPolicies: number;
    totalInsuredValue: number;
    averageInsuredValue: number;
    policiesByStatus: Record<string, number>;
    policiesByType: Record<string, number>;
    expiringIn30Days: number;
    expiringIn90Days: number;
  }> {
    const policies = await this.insurancePolicyRepository.find();
    
    const totalInsuredValue = policies.reduce((sum, p) => sum + Number(p.insuredValue), 0);
    const averageInsuredValue = policies.length > 0 ? totalInsuredValue / policies.length : 0;
    
    const policiesByStatus = policies.reduce((acc, policy) => {
      acc[policy.status] = (acc[policy.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const policiesByType = policies.reduce((acc, policy) => {
      acc[policy.insuranceType] = (acc[policy.insuranceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    
    const expiringIn30Days = policies.filter(p => p.coverageEnd <= in30Days && p.coverageEnd > now).length;
    const expiringIn90Days = policies.filter(p => p.coverageEnd <= in90Days && p.coverageEnd > now).length;

    return {
      totalPolicies: policies.length,
      totalInsuredValue,
      averageInsuredValue,
      policiesByStatus,
      policiesByType,
      expiringIn30Days,
      expiringIn90Days,
    };
  }

  private createQueryBuilder(queryDto: InsuranceQueryDto): SelectQueryBuilder<InsurancePolicy> {
    const queryBuilder = this.insurancePolicyRepository
      .createQueryBuilder('policy')
      .leftJoinAndSelect('policy.documents', 'documents');

    if (queryDto.assetId) {
      queryBuilder.andWhere('policy.assetId = :assetId', { assetId: queryDto.assetId });
    }

    if (queryDto.assetCategory) {
      queryBuilder.andWhere('policy.assetCategory = :assetCategory', { assetCategory: queryDto.assetCategory });
    }

    if (queryDto.provider) {
      queryBuilder.andWhere('policy.provider ILIKE :provider', { provider: `%${queryDto.provider}%` });
    }

    if (queryDto.status) {
      queryBuilder.andWhere('policy.status = :status', { status: queryDto.status });
    }

    if (queryDto.insuranceType) {
      queryBuilder.andWhere('policy.insuranceType = :insuranceType', { insuranceType: queryDto.insuranceType });
    }

    if (queryDto.coverageLevel) {
      queryBuilder.andWhere('policy.coverageLevel = :coverageLevel', { coverageLevel: queryDto.coverageLevel });
    }

    if (queryDto.coverageEndBefore) {
      queryBuilder.andWhere('policy.coverageEnd <= :coverageEndBefore', { 
        coverageEndBefore: new Date(queryDto.coverageEndBefore) 
      });
    }

    if (queryDto.coverageStartAfter) {
      queryBuilder.andWhere('policy.coverageStart >= :coverageStartAfter', { 
        coverageStartAfter: new Date(queryDto.coverageStartAfter) 
      });
    }

    if (queryDto.minInsuredValue) {
      queryBuilder.andWhere('policy.insuredValue >= :minInsuredValue', { 
        minInsuredValue: queryDto.minInsuredValue 
      });
    }

    if (queryDto.maxInsuredValue) {
      queryBuilder.andWhere('policy.insuredValue <= :maxInsuredValue', { 
        maxInsuredValue: queryDto.maxInsuredValue 
      });
    }

    if (queryDto.expired) {
      queryBuilder.andWhere('policy.coverageEnd < :now', { now: new Date() });
    }

    if (queryDto.expiringSoon) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      queryBuilder.andWhere('policy.coverageEnd <= :futureDate', { futureDate })
                  .andWhere('policy.coverageEnd > :now', { now: new Date() });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(policy.policyNumber ILIKE :search OR policy.provider ILIKE :search OR policy.notes ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    queryBuilder.orderBy(`policy.${queryDto.sortBy}`, queryDto.sortOrder);

    return queryBuilder;
  }
}
