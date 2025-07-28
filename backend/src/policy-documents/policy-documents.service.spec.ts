import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PolicyDocumentsService } from "./policy-documents.service";
import { PolicyDocument, PolicyDocumentStatus, PolicyDocumentType } from "./entities/policy-document.entity";
import { CreatePolicyDocumentDto } from "./dto/create-policy-document.dto";
import { UpdatePolicyDocumentDto } from "./dto/update-policy-document.dto";
import { ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";

describe("PolicyDocumentsService", () => {
  let service: PolicyDocumentsService;
  let repository: Repository<PolicyDocument>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    count: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyDocumentsService,
        {
          provide: getRepositoryToken(PolicyDocument),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PolicyDocumentsService>(PolicyDocumentsService);
    repository = module.get<Repository<PolicyDocument>>(getRepositoryToken(PolicyDocument));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new policy document", async () => {
      const createDto: CreatePolicyDocumentDto = {
        title: "Asset Usage Policy",
        version: "1.0",
        filePath: "policy-123.pdf",
        fileName: "policy-123.pdf",
        fileType: "application/pdf",
        fileSize: 1024000,
        authorId: "user-uuid",
        documentType: PolicyDocumentType.ASSET_USAGE,
        status: PolicyDocumentStatus.DRAFT,
      };

      const mockDocument = {
        id: "1",
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockDocument);
      mockRepository.save.mockResolvedValue(mockDocument);

      const result = await service.create(createDto);

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { title: createDto.title, version: createDto.version },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDocument);
    });

    it("should throw ConflictException if document with same title and version exists", async () => {
      const createDto: CreatePolicyDocumentDto = {
        title: "Asset Usage Policy",
        version: "1.0",
        filePath: "policy-123.pdf",
        fileName: "policy-123.pdf",
        fileType: "application/pdf",
        fileSize: 1024000,
        authorId: "user-uuid",
      };

      mockRepository.findOne.mockResolvedValue({ id: "1", title: "Asset Usage Policy", version: "1.0" });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe("findOne", () => {
    it("should return a policy document by id", async () => {
      const mockDocument = {
        id: "1",
        title: "Asset Usage Policy",
        version: "1.0",
        status: PolicyDocumentStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findOne("1");

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: "1" },
        relations: ["author"],
      });
    });

    it("should throw NotFoundException if document not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByTitleAndVersion", () => {
    it("should return a policy document by title and version", async () => {
      const mockDocument = {
        id: "1",
        title: "Asset Usage Policy",
        version: "1.0",
        status: PolicyDocumentStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findByTitleAndVersion("Asset Usage Policy", "1.0");

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { title: "Asset Usage Policy", version: "1.0" },
        relations: ["author"],
      });
    });

    it("should throw NotFoundException if document not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findByTitleAndVersion("Asset Usage Policy", "1.0")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findLatestVersion", () => {
    it("should return the latest version of a policy document", async () => {
      const mockDocument = {
        id: "1",
        title: "Asset Usage Policy",
        version: "2.0",
        isLatestVersion: true,
        status: PolicyDocumentStatus.ACTIVE,
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);

      const result = await service.findLatestVersion("Asset Usage Policy");

      expect(result).toEqual(mockDocument);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { title: "Asset Usage Policy", isLatestVersion: true },
        relations: ["author"],
      });
    });

    it("should throw NotFoundException if latest version not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findLatestVersion("Asset Usage Policy")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findActiveDocuments", () => {
    it("should return all active policy documents", async () => {
      const mockDocuments = [
        { id: "1", title: "Policy 1", status: PolicyDocumentStatus.ACTIVE },
        { id: "2", title: "Policy 2", status: PolicyDocumentStatus.ACTIVE },
      ];

      mockRepository.find.mockResolvedValue(mockDocuments);

      const result = await service.findActiveDocuments();

      expect(result).toEqual(mockDocuments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { status: PolicyDocumentStatus.ACTIVE },
        relations: ["author"],
        order: { title: "ASC", version: "DESC" },
      });
    });
  });

  describe("findPublicDocuments", () => {
    it("should return all public policy documents", async () => {
      const mockDocuments = [
        { id: "1", title: "Public Policy 1", isPublic: true, status: PolicyDocumentStatus.ACTIVE },
        { id: "2", title: "Public Policy 2", isPublic: true, status: PolicyDocumentStatus.ACTIVE },
      ];

      mockRepository.find.mockResolvedValue(mockDocuments);

      const result = await service.findPublicDocuments();

      expect(result).toEqual(mockDocuments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isPublic: true, status: PolicyDocumentStatus.ACTIVE },
        relations: ["author"],
        order: { title: "ASC", version: "DESC" },
      });
    });
  });

  describe("update", () => {
    it("should update a policy document", async () => {
      const updateDto: UpdatePolicyDocumentDto = {
        title: "Updated Asset Usage Policy",
        description: "Updated description",
      };

      const existingDocument = {
        id: "1",
        title: "Asset Usage Policy",
        version: "1.0",
        status: PolicyDocumentStatus.ACTIVE,
      };

      const updatedDocument = {
        ...existingDocument,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingDocument);
      mockRepository.save.mockResolvedValue(updatedDocument);

      const result = await service.update("1", updateDto);

      expect(result).toEqual(updatedDocument);
      expect(mockRepository.save).toHaveBeenCalledWith(updatedDocument);
    });
  });

  describe("updateStatus", () => {
    it("should update document status", async () => {
      const mockDocument = {
        id: "1",
        title: "Asset Usage Policy",
        status: PolicyDocumentStatus.DRAFT,
      };

      const updatedDocument = {
        ...mockDocument,
        status: PolicyDocumentStatus.ACTIVE,
        approvedBy: "admin",
        approvedDate: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.save.mockResolvedValue(updatedDocument);

      const result = await service.updateStatus("1", PolicyDocumentStatus.ACTIVE, "admin");

      expect(result.status).toBe(PolicyDocumentStatus.ACTIVE);
      expect(result.approvedBy).toBe("admin");
    });
  });

  describe("incrementViewCount", () => {
    it("should increment view count", async () => {
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      await service.incrementViewCount("1");

      expect(mockRepository.increment).toHaveBeenCalledWith({ id: "1" }, "viewCount", 1);
    });
  });

  describe("incrementDownloadCount", () => {
    it("should increment download count", async () => {
      mockRepository.increment.mockResolvedValue({ affected: 1 });

      await service.incrementDownloadCount("1");

      expect(mockRepository.increment).toHaveBeenCalledWith({ id: "1" }, "downloadCount", 1);
    });
  });

  describe("getStatistics", () => {
    it("should return document statistics", async () => {
      mockRepository.count.mockResolvedValueOnce(100); // total
      mockRepository.count.mockResolvedValueOnce(50); // active
      mockRepository.count.mockResolvedValueOnce(20); // draft
      mockRepository.count.mockResolvedValueOnce(15); // archived
      mockRepository.count.mockResolvedValueOnce(10); // expired
      mockRepository.count.mockResolvedValueOnce(30); // public
      mockRepository.count.mockResolvedValueOnce(25); // requiring acknowledgment

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalDocuments: 100,
        activeDocuments: 50,
        draftDocuments: 20,
        archivedDocuments: 15,
        expiredDocuments: 10,
        publicDocuments: 30,
        documentsRequiringAcknowledgment: 25,
      });
    });
  });

  describe("remove", () => {
    it("should remove a policy document", async () => {
      const mockDocument = {
        id: "1",
        title: "Asset Usage Policy",
        filePath: "policy-123.pdf",
      };

      mockRepository.findOne.mockResolvedValue(mockDocument);
      mockRepository.remove.mockResolvedValue(mockDocument);

      await service.remove("1");

      expect(mockRepository.remove).toHaveBeenCalledWith(mockDocument);
    });
  });
}); 