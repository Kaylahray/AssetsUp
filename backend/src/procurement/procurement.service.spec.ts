import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ProcurementRequest, ProcurementStatus } from './entities/procurement-request.entity';
import { AssetRegistration, AssetStatus } from './entities/asset-registration.entity';
import {
  CreateProcurementRequestDto,
  ApproveProcurementRequestDto,
  RejectProcurementRequestDto,
  UpdateProcurementRequestDto,
} from './dto/procurement.dto';

describe('ProcurementService', () => {
  let service: ProcurementService;
  let procurementRequestRepository: Repository<ProcurementRequest>;
  let assetRegistrationRepository: Repository<AssetRegistration>;

  const mockProcurementRequestRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAssetRegistrationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcurementService,
        {
          provide: getRepositoryToken(ProcurementRequest),
          useValue: mockProcurementRequestRepository,
        },
        {
          provide: getRepositoryToken(AssetRegistration),
          useValue: mockAssetRegistrationRepository,
        },
      ],
    }).compile();

    service = module.get<ProcurementService>(ProcurementService);
    procurementRequestRepository = module.get<Repository<ProcurementRequest>>(
      getRepositoryToken(ProcurementRequest),
    );
    assetRegistrationRepository = module.get<Repository<AssetRegistration>>(
      getRepositoryToken(AssetRegistration),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new procurement request', async () => {
      const createDto: CreateProcurementRequestDto = {
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        notes: 'Urgent requirement',
      };

      const expectedRequest = {
        id: 1,
        ...createDto,
        status: ProcurementStatus.PENDING,
        requestedAt: new Date(),
        decidedAt: null,
        decidedBy: null,
        assetRegistrationId: null,
      };

      mockProcurementRequestRepository.create.mockReturnValue(expectedRequest);
      mockProcurementRequestRepository.save.mockResolvedValue(expectedRequest);

      const result = await service.create(createDto);

      expect(mockProcurementRequestRepository.create).toHaveBeenCalledWith({
        ...createDto,
        status: ProcurementStatus.PENDING,
      });
      expect(mockProcurementRequestRepository.save).toHaveBeenCalledWith(expectedRequest);
      expect(result).toEqual(expectedRequest);
    });
  });

  describe('findAll', () => {
    it('should return all procurement requests without filters', async () => {
      const expectedRequests = [
        {
          id: 1,
          itemName: 'Laptop',
          quantity: 2,
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
        },
      ];

      mockProcurementRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedRequests);

      const result = await service.findAll();

      expect(mockProcurementRequestRepository.createQueryBuilder).toHaveBeenCalledWith('pr');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('pr.assetRegistration', 'ar');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('pr.requestedAt', 'DESC');
      expect(result).toEqual(expectedRequests);
    });

    it('should return filtered procurement requests', async () => {
      const filters = {
        status: ProcurementStatus.PENDING,
        requestedBy: 'john.doe',
        itemName: 'Laptop',
      };

      const expectedRequests = [
        {
          id: 1,
          itemName: 'Laptop',
          quantity: 2,
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
        },
      ];

      mockProcurementRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(expectedRequests);

      const result = await service.findAll(filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.status = :status', {
        status: filters.status,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('pr.requestedBy = :requestedBy', {
        requestedBy: filters.requestedBy,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(pr.itemName) LIKE LOWER(:itemName)', {
        itemName: `%${filters.itemName}%`,
      });
      expect(result).toEqual(expectedRequests);
    });
  });

  describe('findOne', () => {
    it('should return a procurement request by id', async () => {
      const expectedRequest = {
        id: 1,
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        status: ProcurementStatus.PENDING,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(expectedRequest);

      const result = await service.findOne(1);

      expect(mockProcurementRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['assetRegistration'],
      });
      expect(result).toEqual(expectedRequest);
    });

    it('should throw NotFoundException when procurement request not found', async () => {
      mockProcurementRequestRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockProcurementRequestRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['assetRegistration'],
      });
    });
  });

  describe('update', () => {
    it('should update a pending procurement request', async () => {
      const updateDto: UpdateProcurementRequestDto = {
        itemName: 'Updated Laptop',
        quantity: 3,
        notes: 'Updated notes',
      };

      const existingRequest = {
        id: 1,
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        status: ProcurementStatus.PENDING,
        notes: 'Original notes',
      };

      const updatedRequest = {
        ...existingRequest,
        ...updateDto,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);
      mockProcurementRequestRepository.save.mockResolvedValue(updatedRequest);

      const result = await service.update(1, updateDto);

      expect(mockProcurementRequestRepository.save).toHaveBeenCalledWith(updatedRequest);
      expect(result).toEqual(updatedRequest);
    });

    it('should throw BadRequestException when trying to update non-pending request', async () => {
      const updateDto: UpdateProcurementRequestDto = {
        itemName: 'Updated Laptop',
      };

      const existingRequest = {
        id: 1,
        status: ProcurementStatus.APPROVED,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);

      await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a procurement request and create asset registration', async () => {
      const approveDto: ApproveProcurementRequestDto = {
        decidedBy: 'manager.smith',
        description: 'High-performance laptop',
        cost: 1500.00,
        assignedTo: 'john.doe',
        location: 'Office A',
        notes: 'Approved for immediate procurement',
      };

      const existingRequest = {
        id: 1,
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        status: ProcurementStatus.PENDING,
        notes: 'Original notes',
      };

      const createdAssetRegistration = {
        id: 1,
        assetName: 'Laptop',
        description: approveDto.description,
        cost: approveDto.cost,
        assignedTo: approveDto.assignedTo,
        location: approveDto.location,
        status: AssetStatus.PENDING,
        assetId: '',
        generateAssetId: jest.fn().mockReturnValue('AST-000001'),
      };

      const savedAssetRegistration = {
        ...createdAssetRegistration,
        assetId: 'AST-000001',
      };

      const approvedRequest = {
        ...existingRequest,
        status: ProcurementStatus.APPROVED,
        decidedBy: approveDto.decidedBy,
        decidedAt: expect.any(Date),
        notes: approveDto.notes,
        assetRegistrationId: 1,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);
      mockAssetRegistrationRepository.create.mockReturnValue(createdAssetRegistration);
      mockAssetRegistrationRepository.save
        .mockResolvedValueOnce(createdAssetRegistration)
        .mockResolvedValueOnce(savedAssetRegistration);
      mockProcurementRequestRepository.save.mockResolvedValue(approvedRequest);

      const result = await service.approve(1, approveDto);

      expect(mockAssetRegistrationRepository.create).toHaveBeenCalledWith({
        assetName: existingRequest.itemName,
        description: approveDto.description,
        serialNumber: undefined,
        model: undefined,
        manufacturer: undefined,
        cost: approveDto.cost,
        assignedTo: approveDto.assignedTo,
        location: approveDto.location,
        status: AssetStatus.PENDING,
        assetId: '',
      });
      expect(mockProcurementRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProcurementStatus.APPROVED,
          decidedBy: approveDto.decidedBy,
          assetRegistrationId: 1,
        }),
      );
      expect(result).toEqual({
        procurementRequest: approvedRequest,
        assetRegistration: savedAssetRegistration,
      });
    });

    it('should throw BadRequestException when trying to approve non-pending request', async () => {
      const approveDto: ApproveProcurementRequestDto = {
        decidedBy: 'manager.smith',
        assignedTo: 'john.doe',
      };

      const existingRequest = {
        id: 1,
        status: ProcurementStatus.APPROVED,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);

      await expect(service.approve(1, approveDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject a procurement request', async () => {
      const rejectDto: RejectProcurementRequestDto = {
        decidedBy: 'manager.smith',
        notes: 'Budget constraints',
      };

      const existingRequest = {
        id: 1,
        itemName: 'Laptop',
        status: ProcurementStatus.PENDING,
        notes: 'Original notes',
      };

      const rejectedRequest = {
        ...existingRequest,
        status: ProcurementStatus.REJECTED,
        decidedBy: rejectDto.decidedBy,
        decidedAt: expect.any(Date),
        notes: rejectDto.notes,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);
      mockProcurementRequestRepository.save.mockResolvedValue(rejectedRequest);

      const result = await service.reject(1, rejectDto);

      expect(mockProcurementRequestRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProcurementStatus.REJECTED,
          decidedBy: rejectDto.decidedBy,
          notes: rejectDto.notes,
        }),
      );
      expect(result).toEqual(rejectedRequest);
    });
  });

  describe('remove', () => {
    it('should remove a pending procurement request', async () => {
      const existingRequest = {
        id: 1,
        status: ProcurementStatus.PENDING,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);
      mockProcurementRequestRepository.remove.mockResolvedValue(existingRequest);

      await service.remove(1);

      expect(mockProcurementRequestRepository.remove).toHaveBeenCalledWith(existingRequest);
    });

    it('should throw BadRequestException when trying to remove non-pending request', async () => {
      const existingRequest = {
        id: 1,
        status: ProcurementStatus.APPROVED,
      };

      mockProcurementRequestRepository.findOne.mockResolvedValue(existingRequest);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSummary', () => {
    it('should return procurement summary statistics', async () => {
      mockProcurementRequestRepository.count
        .mockResolvedValueOnce(10) // totalRequests
        .mockResolvedValueOnce(3)  // pendingRequests
        .mockResolvedValueOnce(5)  // approvedRequests
        .mockResolvedValueOnce(2); // rejectedRequests
      mockAssetRegistrationRepository.count.mockResolvedValue(5); // totalAssetsCreated

      const result = await service.getSummary();

      expect(result).toEqual({
        totalRequests: 10,
        pendingRequests: 3,
        approvedRequests: 5,
        rejectedRequests: 2,
        totalAssetsCreated: 5,
      });
    });
  });

  describe('getPendingRequestsByUser', () => {
    it('should return pending requests for a specific user', async () => {
      const expectedRequests = [
        {
          id: 1,
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
        },
      ];

      mockProcurementRequestRepository.find.mockResolvedValue(expectedRequests);

      const result = await service.getPendingRequestsByUser('john.doe');

      expect(mockProcurementRequestRepository.find).toHaveBeenCalledWith({
        where: {
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
        },
        order: { requestedAt: 'DESC' },
      });
      expect(result).toEqual(expectedRequests);
    });
  });

  describe('getAssetsByAssignee', () => {
    it('should return assets assigned to a specific user', async () => {
      const expectedAssets = [
        {
          id: 1,
          assignedTo: 'john.doe',
          assetName: 'Laptop',
        },
      ];

      mockAssetRegistrationRepository.find.mockResolvedValue(expectedAssets);

      const result = await service.getAssetsByAssignee('john.doe');

      expect(mockAssetRegistrationRepository.find).toHaveBeenCalledWith({
        where: { assignedTo: 'john.doe' },
        relations: ['procurementRequest'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedAssets);
    });
  });

  describe('updateAssetStatus', () => {
    it('should update asset status by asset ID', async () => {
      const existingAsset = {
        id: 1,
        assetId: 'AST-000001',
        status: AssetStatus.PENDING,
      };

      const updatedAsset = {
        ...existingAsset,
        status: AssetStatus.ACTIVE,
      };

      mockAssetRegistrationRepository.findOne.mockResolvedValue(existingAsset);
      mockAssetRegistrationRepository.save.mockResolvedValue(updatedAsset);

      const result = await service.updateAssetStatus('AST-000001', AssetStatus.ACTIVE);

      expect(mockAssetRegistrationRepository.save).toHaveBeenCalledWith(updatedAsset);
      expect(result).toEqual(updatedAsset);
    });
  });
});
