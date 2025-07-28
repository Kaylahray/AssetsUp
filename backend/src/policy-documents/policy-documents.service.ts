import { Injectable, NotFoundException, BadRequestException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from "typeorm";
import { PolicyDocument, PolicyDocumentStatus, PolicyDocumentType } from "./entities/policy-document.entity";
import { CreatePolicyDocumentDto } from "./dto/create-policy-document.dto";
import { UpdatePolicyDocumentDto } from "./dto/update-policy-document.dto";
import { QueryPolicyDocumentDto } from "./dto/query-policy-document.dto";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class PolicyDocumentsService {
  constructor(
    @InjectRepository(PolicyDocument)
    private policyDocumentRepository: Repository<PolicyDocument>,
  ) {}

  async create(createPolicyDocumentDto: CreatePolicyDocumentDto): Promise<PolicyDocument> {
    // Check if document with same title and version already exists
    const existingDocument = await this.policyDocumentRepository.findOne({
      where: { 
        title: createPolicyDocumentDto.title,
        version: createPolicyDocumentDto.version 
      },
    });
    if (existingDocument) {
      throw new ConflictException("Document with this title and version already exists");
    }

    // If this is a new version, update previous version's isLatestVersion flag
    if (createPolicyDocumentDto.previousVersionId) {
      await this.policyDocumentRepository.update(
        { id: createPolicyDocumentDto.previousVersionId },
        { isLatestVersion: false }
      );
    }

    const policyDocument = this.policyDocumentRepository.create(createPolicyDocumentDto);
    return this.policyDocumentRepository.save(policyDocument);
  }

  async findAll(queryDto: QueryPolicyDocumentDto) {
    const {
      search,
      status,
      documentType,
      authorId,
      department,
      category,
      tags,
      requiresAcknowledgment,
      isPublic,
      isLatestVersion,
      effectiveDateBefore,
      effectiveDateAfter,
      expiryDateBefore,
      expiryDateAfter,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = queryDto;

    const queryBuilder = this.policyDocumentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.author", "author");

    // Search functionality
    if (search) {
      queryBuilder.andWhere(
        "(document.title ILIKE :search OR document.description ILIKE :search OR document.summary ILIKE :search OR document.keyPoints ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere("document.status = :status", { status });
    }

    // Filter by document type
    if (documentType) {
      queryBuilder.andWhere("document.documentType = :documentType", { documentType });
    }

    // Filter by author
    if (authorId) {
      queryBuilder.andWhere("document.authorId = :authorId", { authorId });
    }

    // Filter by department
    if (department) {
      queryBuilder.andWhere("document.department = :department", { department });
    }

    // Filter by category
    if (category) {
      queryBuilder.andWhere("document.category = :category", { category });
    }

    // Filter by tags
    if (tags) {
      queryBuilder.andWhere("document.tags ILIKE :tags", { tags: `%${tags}%` });
    }

    // Filter by requires acknowledgment
    if (requiresAcknowledgment !== undefined) {
      queryBuilder.andWhere("document.requiresAcknowledgment = :requiresAcknowledgment", { requiresAcknowledgment });
    }

    // Filter by public status
    if (isPublic !== undefined) {
      queryBuilder.andWhere("document.isPublic = :isPublic", { isPublic });
    }

    // Filter by latest version
    if (isLatestVersion !== undefined) {
      queryBuilder.andWhere("document.isLatestVersion = :isLatestVersion", { isLatestVersion });
    }

    // Filter by effective date
    if (effectiveDateBefore || effectiveDateAfter) {
      if (effectiveDateBefore && effectiveDateAfter) {
        queryBuilder.andWhere("document.effectiveDate BETWEEN :effectiveStart AND :effectiveEnd", {
          effectiveStart: effectiveDateAfter,
          effectiveEnd: effectiveDateBefore,
        });
      } else if (effectiveDateBefore) {
        queryBuilder.andWhere("document.effectiveDate <= :effectiveBefore", {
          effectiveBefore: effectiveDateBefore,
        });
      } else if (effectiveDateAfter) {
        queryBuilder.andWhere("document.effectiveDate >= :effectiveAfter", {
          effectiveAfter: effectiveDateAfter,
        });
      }
    }

    // Filter by expiry date
    if (expiryDateBefore || expiryDateAfter) {
      if (expiryDateBefore && expiryDateAfter) {
        queryBuilder.andWhere("document.expiryDate BETWEEN :expiryStart AND :expiryEnd", {
          expiryStart: expiryDateAfter,
          expiryEnd: expiryDateBefore,
        });
      } else if (expiryDateBefore) {
        queryBuilder.andWhere("document.expiryDate <= :expiryBefore", {
          expiryBefore: expiryDateBefore,
        });
      } else if (expiryDateAfter) {
        queryBuilder.andWhere("document.expiryDate >= :expiryAfter", {
          expiryAfter: expiryDateAfter,
        });
      }
    }

    // Sorting
    queryBuilder.orderBy(`document.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [documents, total] = await queryBuilder.getManyAndCount();

    return {
      documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<PolicyDocument> {
    const document = await this.policyDocumentRepository.findOne({
      where: { id },
      relations: ["author"],
    });

    if (!document) {
      throw new NotFoundException(`Policy document with ID ${id} not found`);
    }

    return document;
  }

  async findByTitleAndVersion(title: string, version: string): Promise<PolicyDocument> {
    const document = await this.policyDocumentRepository.findOne({
      where: { title, version },
      relations: ["author"],
    });

    if (!document) {
      throw new NotFoundException(`Policy document with title '${title}' and version '${version}' not found`);
    }

    return document;
  }

  async findLatestVersion(title: string): Promise<PolicyDocument> {
    const document = await this.policyDocumentRepository.findOne({
      where: { title, isLatestVersion: true },
      relations: ["author"],
    });

    if (!document) {
      throw new NotFoundException(`Latest version of policy document '${title}' not found`);
    }

    return document;
  }

  async findActiveDocuments(): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { status: PolicyDocumentStatus.ACTIVE },
      relations: ["author"],
      order: { title: "ASC", version: "DESC" },
    });
  }

  async findPublicDocuments(): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { isPublic: true, status: PolicyDocumentStatus.ACTIVE },
      relations: ["author"],
      order: { title: "ASC", version: "DESC" },
    });
  }

  async findDocumentsByType(documentType: PolicyDocumentType): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { documentType, status: PolicyDocumentStatus.ACTIVE },
      relations: ["author"],
      order: { title: "ASC", version: "DESC" },
    });
  }

  async findExpiringDocuments(daysThreshold: number = 30): Promise<PolicyDocument[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.policyDocumentRepository.find({
      where: {
        expiryDate: LessThanOrEqual(thresholdDate),
        status: PolicyDocumentStatus.ACTIVE,
      },
      relations: ["author"],
    });
  }

  async update(id: string, updatePolicyDocumentDto: UpdatePolicyDocumentDto): Promise<PolicyDocument> {
    const document = await this.findOne(id);

    // Check for title/version conflicts if being updated
    if (updatePolicyDocumentDto.title && updatePolicyDocumentDto.version) {
      const existingDocument = await this.policyDocumentRepository.findOne({
        where: { 
          title: updatePolicyDocumentDto.title,
          version: updatePolicyDocumentDto.version,
          id: { $ne: id } as any,
        },
      });
      if (existingDocument) {
        throw new ConflictException("Document with this title and version already exists");
      }
    }

    Object.assign(document, updatePolicyDocumentDto);
    return this.policyDocumentRepository.save(document);
  }

  async updateStatus(id: string, status: PolicyDocumentStatus, approvedBy?: string): Promise<PolicyDocument> {
    const document = await this.findOne(id);

    document.status = status;
    if (approvedBy) {
      document.approvedBy = approvedBy;
      document.approvedDate = new Date();
    }

    return this.policyDocumentRepository.save(document);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.policyDocumentRepository.increment({ id }, "viewCount", 1);
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.policyDocumentRepository.increment({ id }, "downloadCount", 1);
  }

  async getDocumentFile(id: string): Promise<{ filePath: string; fileName: string; fileType: string }> {
    const document = await this.findOne(id);

    const fullPath = path.join(process.cwd(), "uploads", "policy-documents", document.filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException("Document file not found");
    }

    return {
      filePath: fullPath,
      fileName: document.fileName,
      fileType: document.fileType,
    };
  }

  async getDocumentPreview(id: string): Promise<{ filePath: string; fileName: string; fileType: string }> {
    const document = await this.findOne(id);

    // For PDF files, we can serve them directly
    if (document.fileType.toLowerCase() === "pdf") {
      return this.getDocumentFile(id);
    }

    // For other file types, we might need to convert or handle differently
    throw new BadRequestException("Preview not available for this file type");
  }

  async getStatistics() {
    const totalDocuments = await this.policyDocumentRepository.count();
    const activeDocuments = await this.policyDocumentRepository.count({
      where: { status: PolicyDocumentStatus.ACTIVE },
    });
    const draftDocuments = await this.policyDocumentRepository.count({
      where: { status: PolicyDocumentStatus.DRAFT },
    });
    const archivedDocuments = await this.policyDocumentRepository.count({
      where: { status: PolicyDocumentStatus.ARCHIVED },
    });
    const expiredDocuments = await this.policyDocumentRepository.count({
      where: { status: PolicyDocumentStatus.EXPIRED },
    });
    const publicDocuments = await this.policyDocumentRepository.count({
      where: { isPublic: true },
    });
    const documentsRequiringAcknowledgment = await this.policyDocumentRepository.count({
      where: { requiresAcknowledgment: true },
    });

    return {
      totalDocuments,
      activeDocuments,
      draftDocuments,
      archivedDocuments,
      expiredDocuments,
      publicDocuments,
      documentsRequiringAcknowledgment,
    };
  }

  async getDocumentsByAuthor(authorId: string): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { authorId },
      relations: ["author"],
      order: { createdAt: "DESC" },
    });
  }

  async getDocumentsByDepartment(department: string): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { department },
      relations: ["author"],
      order: { title: "ASC", version: "DESC" },
    });
  }

  async getVersionHistory(title: string): Promise<PolicyDocument[]> {
    return this.policyDocumentRepository.find({
      where: { title },
      relations: ["author"],
      order: { version: "DESC" },
    });
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);

    // Delete the physical file
    const fullPath = path.join(process.cwd(), "uploads", "policy-documents", document.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await this.policyDocumentRepository.remove(document);
  }
} 