import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Department } from '../departments/department.entity';
import { Asset } from '../assets/entities/assest.entity';

describe('BranchesService', () => {
  let service: BranchesService;
  let repository: Repository<Branch>;

  // Mock data
  const mockBranch: Branch = {
    id: 1,
    name: 'Main Branch',
    address: '123 Main St',
    companyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    departments: [],
    assets: [],
  } as Branch;

  const mockBranchWithRelations: Branch = {
    id: 1,
    name: 'Main Branch',
    address: '123 Main St',
    companyId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    departments: [
      { id: 1, name: 'IT Department', companyId: 1, description: '', branchId: 1, createdAt: new Date(), updatedAt: new Date() } as Department
    ],
    assets: [
      { id: '1', serialNumber: 'SN001', name: 'Laptop', purchaseCost: 1000, purchaseDate: new Date(), isActive: true, assignedBranchId: 1, createdAt: new Date(), updatedAt: new Date() } as Asset
    ],
  } as Branch;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: getRepositoryToken(Branch),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
    repository = module.get<Repository<Branch>>(getRepositoryToken(Branch));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new branch', async () => {
      const createDto: CreateBranchDto = {
        name: 'New Branch',
        address: '456 New St',
        companyId: 1,
      };

      mockRepository.create.mockReturnValue(mockBranch);
      mockRepository.save.mockResolvedValue(mockBranch);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockBranch);
      expect(result).toEqual(mockBranch);
    });

    it('should throw ConflictException when branch name already exists', async () => {
      const createDto: CreateBranchDto = {
        name: 'Duplicate Branch',
        address: '456 Duplicate St',
        companyId: 1,
      };

      mockRepository.create.mockReturnValue({ ...mockBranch, ...createDto });
      mockRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when company does not exist', async () => {
      const createDto: CreateBranchDto = {
        name: 'Invalid Branch',
        address: '789 Invalid St',
        companyId: 999,
      };

      mockRepository.create.mockReturnValue({ ...mockBranch, ...createDto });
      mockRepository.save.mockRejectedValue({ code: '23503' });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return an array of branches ordered by creation date', async () => {
      const expectedBranches: Branch[] = [
        { ...mockBranch, id: 2, createdAt: new Date('2023-01-02') },
        { ...mockBranch, id: 1, createdAt: new Date('2023-01-01') },
      ] as Branch[];

      mockRepository.find.mockResolvedValue(expectedBranches);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedBranches);
    });
  });

  describe('findByCompany', () => {
    it('should return branches for a specific company with relations', async () => {
      const companyId = 1;
      const expectedBranches: Branch[] = [
        { ...mockBranchWithRelations, id: 1 },
        { ...mockBranchWithRelations, id: 2 },
      ] as Branch[];

      mockRepository.find.mockResolvedValue(expectedBranches);

      const result = await service.findByCompany(companyId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { companyId },
        order: { createdAt: 'DESC' },
        relations: ['departments', 'assets'],
      });
      expect(result).toEqual(expectedBranches);
    });
  });

  describe('findOne', () => {
    it('should return a branch with relations when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockBranchWithRelations);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['departments', 'assets'],
      });
      expect(result).toEqual(mockBranchWithRelations);
    });

    it('should throw NotFoundException when branch not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['departments', 'assets'],
      });
    });
  });

  describe('update', () => {
    it('should update and save a branch', async () => {
      const updateDto: UpdateBranchDto = {
        name: 'Updated Branch',
        address: '789 Updated St',
      };

      const existingBranch = { ...mockBranch };
      const updatedBranch = { ...existingBranch, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingBranch);
      mockRepository.save.mockResolvedValue(updatedBranch);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['departments', 'assets'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedBranch);
      expect(result).toEqual(updatedBranch);
    });

    it('should throw ConflictException when updating causes duplicate name', async () => {
      const updateDto: UpdateBranchDto = {
        name: 'Duplicate Branch',
      };

      mockRepository.findOne.mockResolvedValue(mockBranch);
      mockRepository.save.mockRejectedValue({ code: '23505' });

      await expect(service.update(1, updateDto)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when trying to update non-existent branch', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a branch', async () => {
      mockRepository.findOne.mockResolvedValue(mockBranch);
      mockRepository.remove.mockResolvedValue(mockBranch);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['departments', 'assets'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockBranch);
    });

    it('should throw NotFoundException when trying to remove non-existent branch', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBranchStats', () => {
    it('should return branch statistics', async () => {
      mockRepository.findOne.mockResolvedValue(mockBranchWithRelations);

      const result = await service.getBranchStats(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['departments', 'assets'],
      });
      expect(result).toEqual({
        departmentCount: 1,
        assetCount: 1,
      });
    });

    it('should return zero counts when branch has no departments or assets', async () => {
      const branchWithoutRelations = {
        ...mockBranch,
        departments: [],
        assets: [],
      } as Branch;

      mockRepository.findOne.mockResolvedValue(branchWithoutRelations);

      const result = await service.getBranchStats(1);

      expect(result).toEqual({
        departmentCount: 0,
        assetCount: 0,
      });
    });
  });
});