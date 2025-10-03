import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AssetDepreciationService } from './asset-depreciation.service';
import { AssetDepreciation, DepreciationMethod } from './entities/asset-depreciation.entity';
import { CreateAssetDepreciationDto, UpdateAssetDepreciationDto } from './dto/asset-depreciation.dto';

describe('AssetDepreciationService', () => {
  let service: AssetDepreciationService;
  let repository: jest.Mocked<Repository<AssetDepreciation>>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    orderBy: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetDepreciationService,
        {
          provide: getRepositoryToken(AssetDepreciation),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AssetDepreciationService>(AssetDepreciationService);
    repository = module.get(getRepositoryToken(AssetDepreciation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateAssetDepreciationDto = {
      assetName: 'Test Laptop',
      description: 'Dell Laptop for testing',
      purchasePrice: 10000,
      purchaseDate: '2023-01-01',
      usefulLifeYears: 5,
      depreciationMethod: DepreciationMethod.STRAIGHT_LINE,
      salvageValue: 1000,
    };

    it('should create an asset depreciation record successfully', async () => {
      const mockAsset = {
        id: 1,
        ...createDto,
        purchaseDate: new Date('2023-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockAsset);
      mockRepository.save.mockResolvedValue(mockAsset);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        purchaseDate: new Date('2023-01-01'),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAsset);
      expect(result).toEqual(mockAsset);
    });

    it('should throw BadRequestException for future purchase date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalidDto = {
        ...createDto,
        purchaseDate: futureDate.toISOString().split('T')[0],
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when salvage value >= purchase price', async () => {
      const invalidDto = {
        ...createDto,
        salvageValue: 10000, // Equal to purchase price
      };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on database unique constraint violation', async () => {
      const dbError = { code: '23505' };
      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(dbError);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return all assets without filters', async () => {
      const mockAssets = [
        createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5),
        createMockAsset(2, 'Desktop', 8000, '2022-01-01', 4),
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockAssets);

      const result = await service.findAll();

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('asset.createdAt', 'DESC');
      expect(result).toEqual(mockAssets);
    });

    it('should apply depreciation method filter', async () => {
      const mockAssets = [createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5)];
      mockQueryBuilder.getMany.mockResolvedValue(mockAssets);

      await service.findAll({ depreciationMethod: 'straight_line' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.depreciationMethod = :method',
        { method: 'straight_line' },
      );
    });

    it('should apply value range filters', async () => {
      const mockAssets = [createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5)];
      mockQueryBuilder.getMany.mockResolvedValue(mockAssets);

      await service.findAll({ minValue: 5000, maxValue: 15000 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.purchasePrice >= :minValue',
        { minValue: 5000 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'asset.purchasePrice <= :maxValue',
        { maxValue: 15000 },
      );
    });
  });

  describe('findOne', () => {
    it('should return an asset by ID', async () => {
      const mockAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5);
      mockRepository.findOne.mockResolvedValue(mockAsset);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockAsset);
    });

    it('should throw NotFoundException when asset not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentValue', () => {
    it('should return depreciated value response DTO', async () => {
      const mockAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5, 1000);
      mockRepository.findOne.mockResolvedValue(mockAsset);

      const result = await service.getCurrentValue(1);

      expect(result.id).toBe(1);
      expect(result.assetName).toBe('Laptop');
      expect(result.purchasePrice).toBe(10000);
      expect(typeof result.currentDepreciatedValue).toBe('number');
      expect(typeof result.annualDepreciation).toBe('number');
    });
  });

  describe('update', () => {
    const updateDto: UpdateAssetDepreciationDto = {
      assetName: 'Updated Laptop',
      purchasePrice: 12000,
    };

    it('should update an asset successfully', async () => {
      const existingAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5);
      const updatedAsset = { ...existingAsset, ...updateDto };

      mockRepository.findOne.mockResolvedValue(existingAsset);
      mockRepository.save.mockResolvedValue(updatedAsset);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedAsset);
    });

    it('should throw BadRequestException for invalid purchase date update', async () => {
      const existingAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const invalidUpdateDto = {
        purchaseDate: futureDate.toISOString().split('T')[0],
      };

      mockRepository.findOne.mockResolvedValue(existingAsset);

      await expect(service.update(1, invalidUpdateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid salvage value update', async () => {
      const existingAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5);
      const invalidUpdateDto = {
        salvageValue: 15000, // Greater than purchase price
      };

      mockRepository.findOne.mockResolvedValue(existingAsset);

      await expect(service.update(1, invalidUpdateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove an asset successfully', async () => {
      const mockAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5);
      mockRepository.findOne.mockResolvedValue(mockAsset);
      mockRepository.remove.mockResolvedValue(mockAsset);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockAsset);
    });

    it('should throw NotFoundException when trying to remove non-existent asset', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSummary', () => {
    it('should return summary statistics', async () => {
      const mockAssets = [
        createMockAsset(1, 'Laptop', 10000, '2022-01-01', 5, 1000),
        createMockAsset(2, 'Desktop', 8000, '2021-01-01', 4, 500),
      ];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockAssets);

      const result = await service.getSummary();

      expect(result.totalAssets).toBe(2);
      expect(result.totalPurchaseValue).toBe(18000);
      expect(typeof result.totalCurrentValue).toBe('number');
      expect(typeof result.averageAge).toBe('number');
    });

    it('should return empty summary for no assets', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.getSummary();

      expect(result.totalAssets).toBe(0);
      expect(result.totalPurchaseValue).toBe(0);
      expect(result.totalCurrentValue).toBe(0);
    });
  });

  describe('getProjectedValue', () => {
    it('should calculate projected value correctly', async () => {
      const mockAsset = createMockAsset(1, 'Laptop', 10000, '2020-01-01', 5, 1000);
      mockRepository.findOne.mockResolvedValue(mockAsset);

      const futureDate = new Date('2030-01-01'); // Use a more distant future date
      const result = await service.getProjectedValue(1, futureDate);

      expect(result.assetName).toBe('Laptop');
      expect(typeof result.currentValue).toBe('number');
      expect(typeof result.projectedValue).toBe('number');
      expect(typeof result.depreciationBetween).toBe('number');
    });

    it('should throw BadRequestException for past date', async () => {
      const mockAsset = createMockAsset(1, 'Laptop', 10000, '2023-01-01', 5, 1000);
      mockRepository.findOne.mockResolvedValue(mockAsset);

      const pastDate = new Date('2022-01-01');
      await expect(service.getProjectedValue(1, pastDate)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Depreciation calculations', () => {
    it('should calculate annual depreciation correctly with salvage value', () => {
      const asset = new AssetDepreciation();
      asset.purchasePrice = 10000;
      asset.usefulLifeYears = 5;
      asset.salvageValue = 1000;

      const annualDepreciation = asset.getAnnualDepreciation();
      expect(annualDepreciation).toBe(1800); // (10000 - 1000) / 5
    });

    it('should calculate annual depreciation correctly without salvage value', () => {
      const asset = new AssetDepreciation();
      asset.purchasePrice = 10000;
      asset.usefulLifeYears = 5;
      asset.salvageValue = null;

      const annualDepreciation = asset.getAnnualDepreciation();
      expect(annualDepreciation).toBe(2000); // 10000 / 5
    });

    it('should calculate current value correctly for recent asset', () => {
      const asset = new AssetDepreciation();
      asset.purchasePrice = 10000;
      asset.purchaseDate = new Date(); // Today
      asset.usefulLifeYears = 5;
      asset.salvageValue = 1000;

      const currentValue = asset.getCurrentDepreciatedValue();
      // Should be close to purchase price for very new asset
      expect(currentValue).toBeGreaterThan(9800);
      expect(currentValue).toBeLessThanOrEqual(10000);
    });

    it('should calculate remaining useful life correctly', () => {
      const asset = new AssetDepreciation();
      asset.purchaseDate = new Date(); // Today
      asset.usefulLifeYears = 5;

      const remainingLife = asset.getRemainingUsefulLife();
      // Should be close to 5 years for new asset
      expect(remainingLife).toBeGreaterThan(4.9);
      expect(remainingLife).toBeLessThanOrEqual(5);
    });

    it('should determine if asset is not fully depreciated when new', () => {
      const asset = new AssetDepreciation();
      asset.purchasePrice = 10000;
      asset.purchaseDate = new Date(); // Today
      asset.usefulLifeYears = 5;
      asset.salvageValue = 1000;

      expect(asset.isFullyDepreciated()).toBe(false);
    });
  });

  // Helper function to create mock asset
  function createMockAsset(
    id: number,
    name: string,
    price: number,
    purchaseDate: string,
    usefulLife: number,
    salvageValue?: number,
  ): AssetDepreciation {
    const asset = new AssetDepreciation();
    asset.id = id;
    asset.assetName = name;
    asset.purchasePrice = price;
    asset.purchaseDate = new Date(purchaseDate);
    asset.usefulLifeYears = usefulLife;
    asset.depreciationMethod = DepreciationMethod.STRAIGHT_LINE;
    asset.salvageValue = salvageValue || null;
    asset.createdAt = new Date();
    asset.updatedAt = new Date();
    return asset;
  }
});
