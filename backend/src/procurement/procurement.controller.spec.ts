import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';
import { ProcurementStatus } from './entities/procurement-request.entity';
import { AssetStatus } from './entities/asset-registration.entity';
import {
  CreateProcurementRequestDto,
  ApproveProcurementRequestDto,
  RejectProcurementRequestDto,
  UpdateProcurementRequestDto,
  ProcurementRequestResponseDto,
  AssetRegistrationResponseDto,
  ProcurementSummaryDto,
} from './dto/procurement.dto';

describe('ProcurementController', () => {
  let controller: ProcurementController;
  let service: ProcurementService;

  const mockProcurementService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    getPendingRequestsByUser: jest.fn(),
    getAssetsByAssignee: jest.fn(),
    getAllAssets: jest.fn(),
    getAssetByAssetId: jest.fn(),
    updateAssetStatus: jest.fn(),
    getAssetRegistration: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcurementController],
      providers: [
        {
          provide: ProcurementService,
          useValue: mockProcurementService,
        },
      ],
    }).compile();

    controller = module.get<ProcurementController>(ProcurementController);
    service = module.get<ProcurementService>(ProcurementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new procurement request', async () => {
      const createDto: CreateProcurementRequestDto = {
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        notes: 'Urgent requirement',
      };

      const mockRequest = {
        id: 1,
        ...createDto,
        status: ProcurementStatus.PENDING,
        requestedAt: new Date(),
        decidedAt: null,
        decidedBy: null,
        assetRegistrationId: null,
      };

      mockProcurementService.create.mockResolvedValue(mockRequest);

      const result = await controller.create(createDto);

      expect(mockProcurementService.create).toHaveBeenCalledWith(createDto);
      expect(result).toBeInstanceOf(ProcurementRequestResponseDto);
      expect(result.id).toBe(1);
      expect(result.itemName).toBe(createDto.itemName);
    });
  });

  describe('findAll', () => {
    it('should return all procurement requests without filters', async () => {
      const mockRequests = [
        {
          id: 1,
          itemName: 'Laptop',
          quantity: 2,
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
          notes: null,
          requestedAt: new Date(),
          decidedAt: null,
          decidedBy: null,
          assetRegistrationId: null,
        },
      ];

      mockProcurementService.findAll.mockResolvedValue(mockRequests);

      const result = await controller.findAll();

      expect(mockProcurementService.findAll).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProcurementRequestResponseDto);
    });

    it('should return filtered procurement requests', async () => {
      const mockRequests = [
        {
          id: 1,
          itemName: 'Laptop',
          quantity: 2,
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
          notes: null,
          requestedAt: new Date(),
          decidedAt: null,
          decidedBy: null,
          assetRegistrationId: null,
        },
      ];

      mockProcurementService.findAll.mockResolvedValue(mockRequests);

      const result = await controller.findAll('pending', 'john.doe', 'Laptop');

      expect(mockProcurementService.findAll).toHaveBeenCalledWith({
        status: ProcurementStatus.PENDING,
        requestedBy: 'john.doe',
        itemName: 'Laptop',
      });
      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(controller.findAll('invalid_status')).rejects.toThrow(BadRequestException);
      expect(mockProcurementService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return procurement summary', async () => {
      const mockSummary = new ProcurementSummaryDto({
        totalRequests: 10,
        pendingRequests: 3,
        approvedRequests: 5,
        rejectedRequests: 2,
        totalAssetsCreated: 5,
      });

      mockProcurementService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary();

      expect(mockProcurementService.getSummary).toHaveBeenCalled();
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getPendingByUser', () => {
    it('should return pending requests for a user', async () => {
      const mockRequests = [
        {
          id: 1,
          itemName: 'Laptop',
          requestedBy: 'john.doe',
          status: ProcurementStatus.PENDING,
          notes: null,
          requestedAt: new Date(),
          decidedAt: null,
          decidedBy: null,
          assetRegistrationId: null,
        },
      ];

      mockProcurementService.getPendingRequestsByUser.mockResolvedValue(mockRequests);

      const result = await controller.getPendingByUser('john.doe');

      expect(mockProcurementService.getPendingRequestsByUser).toHaveBeenCalledWith('john.doe');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProcurementRequestResponseDto);
    });
  });

  describe('getAssetsByAssignee', () => {
    it('should return assets assigned to a user', async () => {
      const mockAssets = [
        {
          id: 1,
          assetId: 'AST-000001',
          assetName: 'Laptop',
          assignedTo: 'john.doe',
          status: AssetStatus.ACTIVE,
          description: null,
          serialNumber: null,
          model: null,
          manufacturer: null,
          cost: null,
          location: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProcurementService.getAssetsByAssignee.mockResolvedValue(mockAssets);

      const result = await controller.getAssetsByAssignee('john.doe');

      expect(mockProcurementService.getAssetsByAssignee).toHaveBeenCalledWith('john.doe');
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AssetRegistrationResponseDto);
    });
  });

  describe('getAllAssets', () => {
    it('should return all assets without filters', async () => {
      const mockAssets = [
        {
          id: 1,
          assetId: 'AST-000001',
          assetName: 'Laptop',
          assignedTo: 'john.doe',
          status: AssetStatus.ACTIVE,
          description: null,
          serialNumber: null,
          model: null,
          manufacturer: null,
          cost: null,
          location: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProcurementService.getAllAssets.mockResolvedValue(mockAssets);

      const result = await controller.getAllAssets();

      expect(mockProcurementService.getAllAssets).toHaveBeenCalledWith({});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AssetRegistrationResponseDto);
    });

    it('should return filtered assets', async () => {
      const mockAssets = [
        {
          id: 1,
          assetId: 'AST-000001',
          assetName: 'Laptop',
          assignedTo: 'john.doe',
          status: AssetStatus.ACTIVE,
          description: null,
          serialNumber: null,
          model: null,
          manufacturer: null,
          cost: null,
          location: 'Office A',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockProcurementService.getAllAssets.mockResolvedValue(mockAssets);

      const result = await controller.getAllAssets('active', 'john.doe', 'Office A');

      expect(mockProcurementService.getAllAssets).toHaveBeenCalledWith({
        status: AssetStatus.ACTIVE,
        assignedTo: 'john.doe',
        location: 'Office A',
      });
      expect(result).toHaveLength(1);
    });

    it('should throw BadRequestException for invalid asset status', async () => {
      await expect(controller.getAllAssets('invalid_status')).rejects.toThrow(BadRequestException);
      expect(mockProcurementService.getAllAssets).not.toHaveBeenCalled();
    });
  });

  describe('getAssetByAssetId', () => {
    it('should return asset by asset ID', async () => {
      const mockAsset = {
        id: 1,
        assetId: 'AST-000001',
        assetName: 'Laptop',
        assignedTo: 'john.doe',
        status: AssetStatus.ACTIVE,
        description: null,
        serialNumber: null,
        model: null,
        manufacturer: null,
        cost: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProcurementService.getAssetByAssetId.mockResolvedValue(mockAsset);

      const result = await controller.getAssetByAssetId('AST-000001');

      expect(mockProcurementService.getAssetByAssetId).toHaveBeenCalledWith('AST-000001');
      expect(result).toBeInstanceOf(AssetRegistrationResponseDto);
      expect(result.assetId).toBe('AST-000001');
    });
  });

  describe('updateAssetStatus', () => {
    it('should update asset status', async () => {
      const mockAsset = {
        id: 1,
        assetId: 'AST-000001',
        assetName: 'Laptop',
        assignedTo: 'john.doe',
        status: AssetStatus.MAINTENANCE,
        description: null,
        serialNumber: null,
        model: null,
        manufacturer: null,
        cost: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProcurementService.updateAssetStatus.mockResolvedValue(mockAsset);

      const result = await controller.updateAssetStatus('AST-000001', AssetStatus.MAINTENANCE, 'admin');

      expect(mockProcurementService.updateAssetStatus).toHaveBeenCalledWith(
        'AST-000001',
        AssetStatus.MAINTENANCE,
        'admin',
      );
      expect(result).toBeInstanceOf(AssetRegistrationResponseDto);
      expect(result.status).toBe(AssetStatus.MAINTENANCE);
    });

    it('should throw BadRequestException for invalid asset status', async () => {
      await expect(
        controller.updateAssetStatus('AST-000001', 'invalid_status' as AssetStatus),
      ).rejects.toThrow(BadRequestException);
      expect(mockProcurementService.updateAssetStatus).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a procurement request by ID', async () => {
      const mockRequest = {
        id: 1,
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        status: ProcurementStatus.PENDING,
        notes: null,
        requestedAt: new Date(),
        decidedAt: null,
        decidedBy: null,
        assetRegistrationId: null,
      };

      mockProcurementService.findOne.mockResolvedValue(mockRequest);

      const result = await controller.findOne(1);

      expect(mockProcurementService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(ProcurementRequestResponseDto);
      expect(result.id).toBe(1);
    });
  });

  describe('getAssetRegistration', () => {
    it('should return asset registration for procurement request', async () => {
      const mockAsset = {
        id: 1,
        assetId: 'AST-000001',
        assetName: 'Laptop',
        assignedTo: 'john.doe',
        status: AssetStatus.ACTIVE,
        description: null,
        serialNumber: null,
        model: null,
        manufacturer: null,
        cost: null,
        location: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProcurementService.getAssetRegistration.mockResolvedValue(mockAsset);

      const result = await controller.getAssetRegistration(1);

      expect(mockProcurementService.getAssetRegistration).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(AssetRegistrationResponseDto);
    });
  });

  describe('approve', () => {
    it('should approve a procurement request', async () => {
      const approveDto: ApproveProcurementRequestDto = {
        decidedBy: 'manager.smith',
        description: 'High-performance laptop',
        cost: 1500.00,
        assignedTo: 'john.doe',
        location: 'Office A',
        notes: 'Approved for immediate procurement',
      };

      const mockResult = {
        procurementRequest: {
          id: 1,
          itemName: 'Laptop',
          quantity: 2,
          requestedBy: 'john.doe',
          status: ProcurementStatus.APPROVED,
          notes: approveDto.notes,
          requestedAt: new Date(),
          decidedAt: new Date(),
          decidedBy: approveDto.decidedBy,
          assetRegistrationId: 1,
        },
        assetRegistration: {
          id: 1,
          assetId: 'AST-000001',
          assetName: 'Laptop',
          description: approveDto.description,
          assignedTo: approveDto.assignedTo,
          location: approveDto.location,
          cost: approveDto.cost,
          status: AssetStatus.PENDING,
          serialNumber: null,
          model: null,
          manufacturer: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      mockProcurementService.approve.mockResolvedValue(mockResult);

      const result = await controller.approve(1, approveDto);

      expect(mockProcurementService.approve).toHaveBeenCalledWith(1, approveDto);
      expect(result.procurementRequest).toBeInstanceOf(ProcurementRequestResponseDto);
      expect(result.assetRegistration).toBeInstanceOf(AssetRegistrationResponseDto);
    });
  });

  describe('reject', () => {
    it('should reject a procurement request', async () => {
      const rejectDto: RejectProcurementRequestDto = {
        decidedBy: 'manager.smith',
        notes: 'Budget constraints',
      };

      const mockRequest = {
        id: 1,
        itemName: 'Laptop',
        quantity: 2,
        requestedBy: 'john.doe',
        status: ProcurementStatus.REJECTED,
        notes: rejectDto.notes,
        requestedAt: new Date(),
        decidedAt: new Date(),
        decidedBy: rejectDto.decidedBy,
        assetRegistrationId: null,
      };

      mockProcurementService.reject.mockResolvedValue(mockRequest);

      const result = await controller.reject(1, rejectDto);

      expect(mockProcurementService.reject).toHaveBeenCalledWith(1, rejectDto);
      expect(result).toBeInstanceOf(ProcurementRequestResponseDto);
      expect(result.status).toBe(ProcurementStatus.REJECTED);
    });
  });

  describe('update', () => {
    it('should update a procurement request', async () => {
      const updateDto: UpdateProcurementRequestDto = {
        itemName: 'Updated Laptop',
        quantity: 3,
        notes: 'Updated notes',
      };

      const mockRequest = {
        id: 1,
        itemName: updateDto.itemName,
        quantity: updateDto.quantity,
        requestedBy: 'john.doe',
        status: ProcurementStatus.PENDING,
        notes: updateDto.notes,
        requestedAt: new Date(),
        decidedAt: null,
        decidedBy: null,
        assetRegistrationId: null,
      };

      mockProcurementService.update.mockResolvedValue(mockRequest);

      const result = await controller.update(1, updateDto);

      expect(mockProcurementService.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toBeInstanceOf(ProcurementRequestResponseDto);
      expect(result.itemName).toBe(updateDto.itemName);
    });
  });

  describe('remove', () => {
    it('should remove a procurement request', async () => {
      mockProcurementService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockProcurementService.remove).toHaveBeenCalledWith(1);
    });
  });
});
