import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

describe('BranchesService', () => {
  let service: BranchesService;
  let repository: Repository<Branch>;

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
      const dto: CreateBranchDto = {
        name: 'Main Branch',
        address: '123 Street',
        companyId: 1,
      };

      const expected: Branch = {
        id: 1,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;

      mockRepository.create.mockReturnValue(expected);
      mockRepository.save.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalledWith(expected);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return an array of branches', async () => {
      const expected: Branch[] = [
        {
          id: 1,
          name: 'Main Branch',
          address: '123 Street',
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Branch,
      ];
      mockRepository.find.mockResolvedValue(expected);
      const result = await service.findAll();
      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return a branch when found', async () => {
      const expected: Branch = {
        id: 1,
        name: 'Main Branch',
        address: '123 Street',
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;
      mockRepository.findOne.mockResolvedValue(expected);
      const result = await service.findOne(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(expected);
    });

    it('should throw when branch not found', async () => {
      mockRepository.findOne.mockResolvedValue(undefined);
      await expect(service.findOne(999)).rejects.toThrow('Branch 999 not found');
    });
  });

  describe('update', () => {
    it('should merge and save updates', async () => {
      const existing: Branch = {
        id: 1,
        name: 'Main Branch',
        address: '123 Street',
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;
      const updates: UpdateBranchDto = { address: '456 Ave' };
      const saved = { ...existing, ...updates } as Branch;
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.save.mockResolvedValue(saved);
      const result = await service.update(1, updates);
      expect(mockRepository.save).toHaveBeenCalledWith(saved);
      expect(result).toEqual(saved);
    });
  });

  describe('remove', () => {
    it('should remove the branch', async () => {
      const existing: Branch = {
        id: 1,
        name: 'Main Branch',
        address: '123 Street',
        companyId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Branch;
      mockRepository.findOne.mockResolvedValue(existing);
      mockRepository.remove.mockResolvedValue(existing);
      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(existing);
    });
  });
});


